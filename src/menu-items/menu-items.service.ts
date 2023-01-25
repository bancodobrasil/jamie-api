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
    const item = manager.getRepository(MenuItem).create({
      ...input,
      menu,
    });
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
    const saved = await manager.save(item);
    if (input.children?.length) {
      await Promise.all(
        input.children.map(async (child, index) => {
          switch (child.action) {
            case MenuItemAction.CREATE:
              child.parentId = saved.id;
              return this.create(
                await saved.menu,
                child as CreateMenuItemInput,
                manager,
                index,
              );
            case MenuItemAction.UPDATE:
              return this.update(child as UpdateMenuItemInput, manager, index);
            case MenuItemAction.DELETE:
              return this.remove(child as DeleteMenuItemInput, manager);
            default:
              throw new Error('unexpected action');
          }
        }),
      );
    }
    return saved;
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
