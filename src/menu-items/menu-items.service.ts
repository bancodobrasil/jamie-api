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
  async create(menu: Menu, input: CreateMenuItemInput, manager: EntityManager) {
    const item = manager.getRepository(MenuItem).create({
      ...input,
      menu,
    });

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

  async update(input: UpdateMenuItemInput, manager: EntityManager) {
    const item = await manager
      .getRepository(MenuItem)
      .findOne({ where: { id: input.id } });
    delete input.action;
    await manager.update(MenuItem, item.id, input);
    if (input.children?.length) {
      await Promise.all(
        input.children.map(async (child) => {
          switch (child.action) {
            case MenuItemAction.CREATE:
              child.parentId = item.id;
              return this.create(
                await item.menu,
                child as CreateMenuItemInput,
                manager,
              );
            case MenuItemAction.UPDATE:
              return this.update(child as UpdateMenuItemInput, manager);
            case MenuItemAction.DELETE:
              return this.remove(child as DeleteMenuItemInput, manager);
            default:
              throw new Error('unexpected action');
          }
        }),
      );
    }
  }

  async remove(input: DeleteMenuItemInput, manager: EntityManager) {
    await manager.remove(plainToClass(MenuItem, { ...input }));
  }

  handle(
    menu: Menu,
    input: CreateMenuItemInput | UpdateMenuItemInput | DeleteMenuItemInput,
    manager: EntityManager,
  ) {
    switch (input.action) {
      case MenuItemAction.CREATE:
        return this.create(menu, input as CreateMenuItemInput, manager);
      case MenuItemAction.UPDATE:
        return this.update(input as UpdateMenuItemInput, manager);
      case MenuItemAction.DELETE:
        return this.remove(input as DeleteMenuItemInput, manager);
      default:
        throw new Error('unexpected action');
    }
  }
}
