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
import { CreateMenuMetaInput } from './inputs/create-menu-meta.input';

@Injectable()
export class MenusService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    private readonly menuItemsService: MenuItemsService,
  ) {}

  async create(createMenuInput: CreateMenuInput) {
    const { meta, ...rest } = createMenuInput;
    const metaWithIds = meta?.map((m) => ({ ...m, id: m.order }));
    const menu = await this.menuRepository.create({
      ...rest,
      meta: metaWithIds,
    });
    return this.menuRepository.save(menu);
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
      menu.meta = updatedMeta;

      const saved = await queryRunner.manager.save(menu);

      if (updateMenuInput.items) {
        await Promise.all(
          updateMenuInput.items.map((mii) =>
            this.menuItemsService.handle(saved, mii, queryRunner.manager),
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
    let meta =
      menu.meta
        ?.map((m) => {
          const update = input.find((i) => i.id === m.id);
          if (!update) return m;
          if (update.action === InputAction.DELETE) return null;
          return { ...m, ...update };
        })
        .filter((m) => m !== null)
        .sort((a, b) => a.id - b.id) || [];
    const lastId = meta[meta.length - 1]?.id || 0;
    const create = input
      .filter((i) => i.action === InputAction.CREATE)
      .sort((a, b) => a.order - b.order)
      .map((i, index) => ({
        ...i,
        id: lastId + index + 1,
      })) as CreateMenuMetaInput[] & { id: number }[];
    if (create.length) {
      meta = [...meta, ...create];
    }
    return meta.sort((a, b) => a.order - b.order);
  }
}
