import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuItemsService } from 'src/menu-items/menu-items.service';
import { DataSource, Repository } from 'typeorm';
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
      const { meta, ...rest } = updateMenuInput;
      const menu = await queryRunner.manager
        .getRepository(Menu)
        .preload({ id, ...rest });

      const updatedMeta = this.handleMeta(menu, meta);
      menu.meta = updatedMeta as MenuMeta[];

      const saved = await queryRunner.manager.save(menu);

      if (updateMenuInput.items) {
        await Promise.all(
          updateMenuInput.items.map((mii, i) =>
            this.menuItemsService.handle(
              saved,
              mii,
              queryRunner.manager,
              i,
              updateMenuInput.items.filter((m2, i2) => i2 !== i),
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

  remove(id: number) {
    return this.menuRepository.delete(id);
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

  async createRevision(input: CreateMenuRevisionInput) {
    const menu = await this.menuRepository.findOne({
      where: { id: input.menuId },
    });

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

    return this.revisionRepository.save({
      ...input,
      menu,
      snapshot,
      id,
    });
  }
}
