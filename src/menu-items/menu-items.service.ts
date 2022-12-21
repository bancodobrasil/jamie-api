import { Injectable } from '@nestjs/common';
import { CreateMenuItemInput } from './dto/create-menu-item.input';
import { UpdateMenuItemInput } from './dto/update-menu-item.input';

@Injectable()
export class MenuItemsService {
  create(createMenuInput: CreateMenuItemInput) {
    return 'This action adds a new menu item';
  }

  findAll(query: any) {
    return `This action returns all menu items`;
  }

  findOne(id: number) {
    return `This action returns a #${id} menu item`;
  }

  update(id: number, updateMenuInput: UpdateMenuItemInput) {
    return `This action updates a #${id} menu item`;
  }

  remove(id: number) {
    return `This action removes a #${id} menu item`;
  }
}
