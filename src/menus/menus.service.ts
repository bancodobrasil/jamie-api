import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuItemsService } from 'src/menu-items/menu-items.service';
import { DataSource, Repository } from 'typeorm';
import { CreateMenuInput } from './dto/create-menu.input';
import { UpdateMenuInput } from './dto/update-menu.input';
import { Menu } from './entities/menu.entity';

@Injectable()
export class MenusService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    private readonly menuItemsService: MenuItemsService,
  ) {}

  async create(createMenuInput: CreateMenuInput) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const menu = new Menu();
      menu.name = createMenuInput.name;
      menu.meta = createMenuInput.meta;

      const saved = await queryRunner.manager.save(menu);

      if (createMenuInput.items) {
        await Promise.all(
          createMenuInput.items.map((mii, index) =>
            this.menuItemsService.handle(
              saved,
              mii,
              queryRunner.manager,
              index,
            ),
          ),
        );
      }

      await queryRunner.commitTransaction();

      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return this.menuRepository.find();
  }

  findOne(id: number) {
    return this.menuRepository.findOneBy({ id: id });
  }

  async update(id: number, updateMenuInput: UpdateMenuInput) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const menu = await queryRunner.manager
        .getRepository(Menu)
        .preload({ id, ...updateMenuInput });

      const saved = await queryRunner.manager.save(menu);

      if (updateMenuInput.items) {
        await Promise.all(
          updateMenuInput.items.map((mii, index) =>
            this.menuItemsService.handle(
              saved,
              mii,
              queryRunner.manager,
              index,
            ),
          ),
        );
      }

      await queryRunner.commitTransaction();

      return saved;
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
}
