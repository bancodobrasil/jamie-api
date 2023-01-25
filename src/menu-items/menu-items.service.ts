import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from 'src/menus/entities/menu.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateMenuItemInput } from './dto/create-menu-item.input';
import { MenuItem } from './entities/menu-item.entity';
import { plainToClass } from 'class-transformer';
import { UpdateMenuItemInput } from './dto/update-menu-item.input';
import { MenuItemAction } from 'src/common/types';
import { DeleteMenuItemInput } from './dto/delete-menu-item.input';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}
  async create(
    menu: Menu,
    input: CreateMenuItemInput,
    manager: EntityManager,
    index: number,
  ) {
    const item = new MenuItem();
    item.menu = menu;
    item.label = input.label;
    item.order = input.order;
    item.meta = input.meta;

    await item.validateMeta(index);
    return manager.save(item);
  }

  findAll(query: any) {
    // return `This action returns all menu items`;
    return this.menuItemRepository.find({
      where: [{ menu: { id: query.menuId } }],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} menu item`;
  }

  async update(
    input: UpdateMenuItemInput,
    manager: EntityManager,
    index: number,
  ) {
    const item = await manager.getRepository(MenuItem).preload({ ...input });
    await item.validateMeta(index);
    return manager.save(item);
  }

  async remove(input: DeleteMenuItemInput, manager: EntityManager) {
    await manager.remove(plainToClass(MenuItem, { ...input }));
  }

  handle(
    menu: Menu,
    input: CreateMenuItemInput | UpdateMenuItemInput | DeleteMenuItemInput,
    manager: EntityManager,
    index: number,
  ) {
    switch (input.action) {
      case MenuItemAction.CREATE:
        return this.create(menu, input as CreateMenuItemInput, manager, index);
      case MenuItemAction.UPDATE:
        return this.update(input as UpdateMenuItemInput, manager, index);
      case MenuItemAction.DELETE:
        return this.remove(input as DeleteMenuItemInput, manager);
      default:
        throw new Error('unexpected action');
    }
  }
}
