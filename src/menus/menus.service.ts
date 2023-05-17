import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';
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
import TemplateHelpers from 'src/common/helpers/template.helper';
import { StoreService } from 'src/store/store.service';
import { RenderMenuTemplateInput } from './inputs/render-menu-template.input';
import { RenderMenuItemTemplateInput } from './inputs/render-menu-item-template.input';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { MenuPendency } from './entities/menu-pendency.entity';
import { KeycloakUser } from 'src/common/schema/objects/keycloak-user.object';
import { KeycloakAccessToken } from 'src/common/types/keycloak.type';
import { ForbiddenError } from 'apollo-server-express';
import { BadTemplateFormatError } from './errors/bad-template-format.error';
import { MenuItemSnapshot, MenuRevisionSnapshot } from 'src/common/types';
import { FeatwsApiService } from 'src/http-clients/featws-api/featws-api.service';

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
    @InjectRepository(MenuPendency)
    private pendencyRepository: Repository<MenuPendency>,
    private readonly menuItemsService: MenuItemsService,
    private readonly storeService: StoreService,
    private readonly featwsApiService: FeatwsApiService,
  ) {}

  async create(createMenuInput: CreateMenuInput) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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
      await queryRunner.manager.save(menu, { data: { items } });
      if (menu.hasConditions) {
        const rulesheet = await this.featwsApiService.createRulesheet({
          name: menu.name,
          // TODO: Set the correct initial rulesheet version
          version: '1',
        });
        await queryRunner.manager.save({ ...menu, rulesheetId: rulesheet.id });
      }
      await queryRunner.commitTransaction();
      return this.menuRepository.findOne({
        where: { id: menu.id },
        relations: ['items'],
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
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

  async update(
    id: number,
    updateMenuInput: UpdateMenuInput,
    user: KeycloakAccessToken,
  ) {
    try {
      const menu = await this.menuRepository.findOneOrFail({
        where: { id },
        relations: ['items'],
      });

      if (menu.mustDeferChanges) {
        await this.createPendency(updateMenuInput, menu, user);
        return menu;
      }

      const saved = await this.updateMenu(menu, updateMenuInput);

      if (saved.hasConditions) {
        const items = await saved.items;
        let features, parameters, rules;
        features = parameters = [];
        rules = {};
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemFeatures = JSON.parse(item.features) || [];
          features = [...features, ...itemFeatures];
          const itemParameters = JSON.parse(item.parameters) || [];
          parameters = [...parameters, ...itemParameters];
          if (item.rules) {
            const itemRules = {
              [`menu_${item.id}`]: {
                value: JSON.parse(item.rules) || {},
              },
            };
            rules = { ...rules, ...itemRules };
          }
        }
        await this.featwsApiService.updateRulesheet({
          id: saved.rulesheetId,
          name: saved.name,
          version: String(saved.version),
          features,
          parameters,
          rules,
        });
      }

      return saved;
    } catch (err) {
      if (err instanceof EntityNotFoundErrorTypeOrm) {
        throw new EntityNotFoundError(Menu, id);
      }
      throw err;
    }
  }

  private async updateMenu(menu: Menu, updateMenuInput: UpdateMenuInput) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { meta, items, template, templateFormat, ...rest } =
        updateMenuInput;

      if (template) {
        if (
          (templateFormat && templateFormat === TemplateFormat.JSON) ||
          (!templateFormat && menu.templateFormat === TemplateFormat.JSON)
        ) {
          const menuItems = await menu.items;
          const getChildren = (
            parent: MenuItem,
          ): RenderMenuItemTemplateInput[] => {
            const children = menuItems
              .filter((item) => item.parentId === parent.id)
              .map((item: MenuItem) => {
                return {
                  ...item,
                  children: getChildren(item),
                };
              })
              .sort((a, b) => a.order - b.order);
            return children;
          };
          const inputItems: RenderMenuItemTemplateInput[] =
            menuItems
              .map((item: MenuItem) => {
                return {
                  ...item,
                  children: getChildren(item),
                };
              })
              .filter((item) => !item.parentId)
              .sort((a, b) => a.order - b.order) || [];
          const inputMenu: RenderMenuTemplateInput = {
            ...menu,
            template,
            templateFormat,
            items: inputItems,
          };
          try {
            const renderedTemplate = this.renderMenuTemplate(inputMenu);
            JSON.parse(renderedTemplate);
          } catch (err) {
            throw new BadTemplateFormatError(err);
          }
        }
      }

      Object.assign(menu, { ...rest, template, templateFormat });

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

  async createPendency(
    input: UpdateMenuInput,
    menu: Menu,
    user: KeycloakAccessToken,
  ) {
    const submittedBy: KeycloakUser = {
      id: user.sub,
      username: user.preferred_username,
      email: user.email,
      firstName: user.given_name,
      lastName: user.family_name,
    };
    const pendency = await this.pendencyRepository.create({
      menuId: menu.id,
      submittedBy,
      input,
    });
    return this.pendencyRepository.save(pendency);
  }

  async findAllPendencies(paginationArgs: PaginationArgs, menuId: number) {
    const query = await this.pendencyRepository
      .createQueryBuilder()
      .where({
        menuId,
      })
      .select();
    return paginate(query, paginationArgs);
  }

  async approvePendency(id: number, menuId: number, user: KeycloakAccessToken) {
    const menu = await this.menuRepository.findOneOrFail({
      where: { id: menuId },
    });
    const pendency = await this.pendencyRepository.findOneOrFail({
      where: { id, menuId },
    });
    const { input, submittedBy } = pendency;
    if (submittedBy.id === user.sub) {
      throw new ForbiddenError('Cannot approve your own pendency');
    }
    const updated = await this.updateMenu(menu, input);
    await this.pendencyRepository.remove(pendency);
    return updated;
  }

  async declinePendency(id: number, menuId: number, user: KeycloakAccessToken) {
    const pendency = await this.pendencyRepository.findOneOrFail({
      where: { id, menuId },
    });
    const { submittedBy } = pendency;
    if (submittedBy.id === user.sub) {
      throw new ForbiddenError('Cannot decline your own pendency');
    }
    await this.pendencyRepository.remove(pendency);
    return true;
  }

  async createRevision({
    setAsCurrent,
    menuId,
    description,
  }: CreateMenuRevisionInput) {
    try {
      // Removing the following properties from the menu object
      const {
        id: _id,
        uuid,
        currentRevision,
        currentRevisionId,
        publishedRevisionId,
        publishedRevision,
        defaultTemplate,
        version,
        createdAt,
        updatedAt,
        deletedAt,
        rulesheetId,
        // Spread the rest of the properties into snapshot
        ...snapshotOld
      } = await this.menuRepository.findOneOrFail({
        where: { id: menuId },
      });

      const items = await this.itemRepository.find({
        where: { menuId },
      });

      const snapshot: MenuRevisionSnapshot = snapshotOld;

      snapshot.items = items.map((i) => {
        // Removing the following properties from the items object
        // and mapping ...rest to the snapshot
        const {
          menuId,
          defaultTemplate,
          version,
          createdAt,
          updatedAt,
          deletedAt,
          ...rest
        } = i;

        return rest;
      });

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

      const snapshotItems = await revision.snapshot.items;

      const getChildren = (
        snapshotItems: MenuItemSnapshot[],
        item: MenuItemSnapshot,
      ) => {
        const children = snapshotItems.filter((i) => i.parentId === item.id);
        return children.map((c) => ({
          ...c,
          children: getChildren(snapshotItems, c),
        }));
      };

      const items = snapshotItems
        .filter((i) => !i.parentId)
        .map((i: MenuItemSnapshot) => ({
          ...i,
          children: getChildren(snapshotItems, i),
        }));

      const formattedSnapshot = {
        ...revision.snapshot,
        templateFormat: TemplateFormat[revision.snapshot.templateFormat],
        items,
      };
      const content = this.renderMenuTemplate(formattedSnapshot);

      await this.storeService.put(`${menu.uuid}/${revisionId}.jamie`, content);
      await this.storeService.put(`${menu.uuid}/current.jamie`, content);

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

  renderMenuTemplate(menu: RenderMenuTemplateInput): string {
    let items = menu.items?.map((item: RenderMenuItemTemplateInput) =>
      this.menuItemsService.getItemForTemplate(item, menu),
    );
    items =
      items
        .filter((item) => !item.parentId)
        .sort((a, b) => a.order - b.order) || [];
    try {
      TemplateHelpers.setup();
      const result = Handlebars.compile(menu.template)({
        menu: {
          ...menu,
          items,
        },
      });
      if (menu.templateFormat === TemplateFormat.JSON) {
        JSON.parse(result);
      }
      return result;
    } catch (err) {
      console.error(err);
      throw new BadTemplateFormatError(err);
    }
  }

  renderMenuItemTemplate(
    item: RenderMenuItemTemplateInput,
    menu: RenderMenuTemplateInput,
  ) {
    return this.menuItemsService.renderMenuItemTemplate(item, menu);
  }
}
