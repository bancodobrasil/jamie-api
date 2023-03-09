import { Injectable } from '@nestjs/common';
import { render } from 'ejs';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuItemsService } from 'src/menu-items/menu-items.service';
import {
  DataSource,
  EntityNotFoundError as EntityNotFoundErrorTypeOrm,
  Repository,
} from 'typeorm';
import { CreateMenuInput } from './inputs/create-menu.input';
import { UpdateMenuInput } from './inputs/update-menu.input';
import { Menu } from './entities/menu.entity';
import { PaginationArgs } from 'src/common/schema/args/pagination.arg';
import { FindMenuSortArgs } from './args/find-menu-sort.arg';
import { paginate } from 'src/common/helpers/paginate.helper';
import { UpdateMenuMetaInput } from './inputs/update-menu-meta.input';
import { InputAction } from 'src/common/schema/enums/input-action.enum';
import { MenuMeta } from './objects/menu-meta.object';
import { MenuRevision } from './entities/menu-revision.entity';
import { CreateMenuRevisionInput } from './inputs/create-menu-revision.input';
import { MenuItem } from 'src/menu-items/entities/menu-item.entity';
import { EntityNotFoundError } from 'src/common/errors/entity-not-found.error';
import { Client } from 'minio';
import { storeConfig } from '../../config/store.config';

@Injectable()
export class MenusService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(MenuItem)
    private itemRepository: Repository<MenuItem>,
    @InjectRepository(MenuRevision)
    private revisionRepository: Repository<MenuRevision>,
    private readonly menuItemsService: MenuItemsService,
  ) {}

  async create(createMenuInput: CreateMenuInput) {
    const { meta, items, ...rest } = createMenuInput;
    const metaWithIds = meta
      ?.sort((a, b) => a.order - b.order)
      .map((m, index) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { action, ...rest } = m;
        return { ...rest, id: index + 1 };
      });
    const menu = await this.menuRepository.create({
      ...rest,
      meta: metaWithIds,
    });
    await this.menuRepository.save(menu, { data: { items } });
    return this.menuRepository.findOne({
      where: { id: menu.id },
      relations: ['items'],
    });
  }

  async findAll(paginationArgs: PaginationArgs, sortArgs: FindMenuSortArgs) {
    const query = await this.menuRepository.createQueryBuilder().select();

    return paginate(query, paginationArgs, sortArgs.sort, sortArgs.direction);
  }

  findOne(id: number) {
    try {
      return this.menuRepository.findOneByOrFail({ id: id });
    } catch (err) {
      throw new EntityNotFoundError(Menu, id);
    }
  }

  async update(id: number, updateMenuInput: UpdateMenuInput) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { meta, items, ...rest } = updateMenuInput;
      const menu = await queryRunner.manager
        .getRepository(Menu)
        .findOneOrFail({ where: { id } });
      Object.assign(menu, rest);

      const updatedMeta = this.handleMeta(menu, meta);
      menu.meta = updatedMeta as MenuMeta[];

      const saved = await queryRunner.manager.save(menu);

      if (items) {
        await Promise.all(
          items.map((mii, i) =>
            this.menuItemsService.handle(
              saved,
              mii,
              queryRunner.manager,
              i,
              items.filter((m2, i2) => i2 !== i),
            ),
          ),
        );
      }

      await queryRunner.commitTransaction();

      return this.menuRepository.findOne({
        where: { id: saved.id },
        relations: ['items'],
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof EntityNotFoundErrorTypeOrm) {
        throw new EntityNotFoundError(Menu, id);
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    try {
      const menu = await this.menuRepository.findOneOrFail({ where: { id } });
      await this.menuRepository.remove(menu);
      return true;
    } catch (err) {
      throw new EntityNotFoundError(Menu, id);
    }
  }

  handleMeta(menu: Menu, input?: UpdateMenuMetaInput[]) {
    if (!input || !input.length) return menu.meta;
    let updatedMeta = input.filter(
      (i) => i.action === InputAction.UPDATE || i.action === InputAction.DELETE,
    );
    const lastId = menu.meta?.sort((a, b) => a.id - b.id).pop()?.id || 0;
    const create = input
      .filter((i) => i.action === InputAction.CREATE)
      .sort((a, b) => a.order - b.order)
      .map((i, index) => ({
        ...i,
        id: lastId + index + 1,
      }));
    if (create.length) {
      updatedMeta = [...updatedMeta, ...create];
    }
    return updatedMeta.sort((a, b) => a.order - b.order);
  }

  async createRevision({
    setAsCurrent,
    menuId,
    description,
  }: CreateMenuRevisionInput) {
    try {
      const { name, meta, template, templateFormat } =
        await this.menuRepository.findOneOrFail({
          where: { id: menuId },
        });

      const items = await this.itemRepository.find({
        where: { menuId },
      });

      const snapshot = {
        name,
        meta,
        template,
        templateFormat,
        items,
      };

      const revisions = await this.revisionRepository.find({
        where: { menuId },
      });

      let id = 1;
      if (revisions?.length) {
        id = revisions.sort((a, b) => b.id - a.id)[0].id + 1;
      }

      const revision = await this.revisionRepository.create({
        description,
        menuId,
        snapshot,
        id,
      });

      if (setAsCurrent) {
        await this.menuRepository.save({
          id: menuId,
          currentRevision: revision,
        });
      } else {
        await this.revisionRepository.save(revision);
      }

      return this.menuRepository.findOne({
        where: { id: menuId },
        relations: ['items', 'revisions'],
      });
    } catch (err) {
      if (err instanceof EntityNotFoundErrorTypeOrm) {
        throw new EntityNotFoundError(Menu, menuId);
      }
      throw err;
    }
  }

  async restoreRevision(menuId: number, revisionId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let menu;
      try {
        menu = await queryRunner.manager
          .getRepository(Menu)
          .findOneOrFail({ where: { id: menuId } });
      } catch (err) {
        throw new EntityNotFoundError(Menu, menuId);
      }

      const revision = await queryRunner.manager
        .getRepository(MenuRevision)
        .findOneOrFail({ where: { menuId, id: revisionId } });

      const previousItems = await queryRunner.manager
        .getRepository(MenuItem)
        .find({ where: { menuId } });

      await queryRunner.manager.remove(previousItems);

      const { items, ...snapshot } = revision.snapshot;

      menu = await queryRunner.manager.save(
        Menu,
        {
          ...menu,
          ...snapshot,
          currentRevision: revision,
        },
        { data: { replaceMeta: true } },
      );

      const itemsWithMenu = items.map((i, index) => {
        const siblings = items.filter(
          (m2, i2) => i2 !== index && m2.parentId === i.parentId,
        );
        return { ...i, menu, index, siblings };
      });

      const savedItems = await queryRunner.manager.save(
        MenuItem,
        itemsWithMenu,
      );

      await queryRunner.commitTransaction();

      menu.items = savedItems;

      return this.menuRepository.findOne({
        where: { id: menu.id },
        relations: ['items', 'revisions'],
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof EntityNotFoundErrorTypeOrm) {
        throw new EntityNotFoundError(MenuRevision, revisionId);
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async publishRevision(menuId: number, revisionId: number) {
    try {
      let menu;
      try {
        menu = await this.menuRepository.findOneOrFail({
          where: { id: menuId },
          relations: ['items'],
        });
      } catch (err) {
        throw new EntityNotFoundError(Menu, menuId);
      }

      if (menu.publishedRevision?.id === revisionId) {
        return menu;
      }

      const revision = await this.revisionRepository.findOneOrFail({
        where: { menuId, id: revisionId },
      });

      const content = await this.renderMenu(revision.snapshot as Menu);

      await this.persistOnStore(menu.uuid, `${revisionId}`, content);

      await this.persistOnStore(menu.uuid, 'current', content);

      menu = await this.menuRepository.save({
        ...menu,
        publishedRevision: revision,
      });

      return this.menuRepository.findOne({
        where: { id: menu.id },
        relations: ['items', 'revisions'],
      });
    } catch (err) {
      if (err instanceof EntityNotFoundErrorTypeOrm) {
        throw new EntityNotFoundError(MenuRevision, revisionId);
      }
      throw err;
    }
  }

  async persistOnStore(uuid: string, revisionId: string, content: string) {
    const cfg = storeConfig();
    if (cfg.target == 's3') {
      const minioClient = new Client(cfg.s3);

      await minioClient.putObject(
        cfg.s3.bucket,
        `${uuid}/${revisionId}.jamie`,
        content,
      );
      return;
    }

    throw new Error('wrong store target');
  }

  async renderMenu(menu: Menu) {
    let items: MenuItem[] = menu.items || [];
    const getChildren = (parent: MenuItem): MenuItem[] => {
      const children = items
        .filter((item) => item.parentId === parent.id)
        .map((item: MenuItem) => {
          const { template, templateFormat, ...rest } = item;
          let formattedTemplate = template;
          if (template) {
            formattedTemplate = render(template, {
              item: {
                ...rest,
                children: getChildren(item),
                templateFormat,
              },
            });
            if (templateFormat === 'json') {
              formattedTemplate = JSON.parse(formattedTemplate);
            }
          }
          return {
            ...rest,
            children: getChildren(item),
            template: formattedTemplate,
            templateFormat,
          };
        })
        .sort((a, b) => a.order - b.order);
      return children;
    };
    items =
      items
        .map((item: MenuItem) => {
          const { template, templateFormat, ...rest } = item;
          let formattedTemplate = template;
          if (template) {
            formattedTemplate = render(template, {
              item: {
                ...rest,
                children: getChildren(item),
                templateFormat,
              },
            });
            if (templateFormat === 'json') {
              formattedTemplate = JSON.parse(formattedTemplate);
            }
          }
          return {
            ...rest,
            children: getChildren(item),
            template: formattedTemplate,
            templateFormat,
          };
        })
        .filter((item) => !item.parentId)
        .sort((a, b) => a.order - b.order) || [];
    try {
      const { ...rest } = menu;
      if (rest.meta)
        rest.meta = rest.meta.map((meta: MenuMeta) => {
          const { ...rest } = meta;
          return rest;
        });
      return render(menu.template, {
        menu: {
          ...rest,
          items,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
