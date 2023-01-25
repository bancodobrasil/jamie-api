import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from 'src/menus/entities/menu.entity';
import { Repository } from 'typeorm';
import { MenuItemAction, MenuItemInput } from './dto/menu-item.input';
import { MenuItem } from './entities/menu-item.entity';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}
  create(createMenuInput: MenuItemInput) {
    return 'This action adds a new menu item';
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

  update(id: number, updateMenuInput: MenuItemInput) {
    return `This action updates a #${id} menu item`;
  }

  remove(id: number) {
    return `This action removes a #${id} menu item`;
  }

  handle(menu: Menu, input: MenuItemInput) {
    if (
      input.action == MenuItemAction.CREATE ||
      input.action == MenuItemAction.UPDATE
    ) {
      const item = new MenuItem();

      item.id = input.id;
      item.menu = menu;
      item.label = input.label;
      item.order = input.order;
      item.meta = input.meta;
      return this.menuItemRepository.save(item);
    }

    if (input.action == MenuItemAction.DELETE) {
      this.menuItemRepository.delete(input.id);
      return;
    }

    throw new Error('unexpected action');
  }
}
