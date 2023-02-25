import { Injectable } from '@nestjs/common';
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
    return this.menuRepository.findOneBy({ id: id });
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

  async createRevision({ setAsCurrent, ...input }: CreateMenuRevisionInput) {
    try {
      const menu = await this.menuRepository.findOneOrFail({
        where: { id: input.menuId },
      });

      delete menu.currentRevision;

      const items = await this.itemRepository.find({
        where: { menuId: input.menuId },
      });

      const snapshot = JSON.stringify({ ...menu, items });

      const revisions = await this.revisionRepository.find({
        where: { menuId: input.menuId },
      });

      let id = 1;
      if (revisions?.length) {
        id = revisions.sort((a, b) => b.id - a.id)[0].id + 1;
      }

      const revision = await this.revisionRepository.create({
        ...input,
        menu,
        snapshot,
        id,
      });

      if (setAsCurrent) {
        await this.menuRepository.save({
          ...menu,
          currentRevision: revision,
        });
      } else {
        await this.revisionRepository.save(revision);
      }

      return revision;
    } catch (err) {
      if (err instanceof EntityNotFoundErrorTypeOrm) {
        throw new EntityNotFoundError(Menu, input.menuId);
      }
      throw err;
    }
  }

  async restoreRevision(menuId: number, revisionId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const revision = await queryRunner.manager
        .getRepository(MenuRevision)
        .findOne({ where: { menuId, id: revisionId } });

      let menu = await queryRunner.manager
        .getRepository(Menu)
        .findOneOrFail({ where: { id: menuId } });

      const previousItems = await queryRunner.manager
        .getRepository(MenuItem)
        .find({ where: { menuId } });

      await queryRunner.manager.remove(previousItems);

      const { items, ...snapshot } = JSON.parse(revision.snapshot);

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

      return menu;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof EntityNotFoundErrorTypeOrm) {
        throw new EntityNotFoundError(Menu, menuId);
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
