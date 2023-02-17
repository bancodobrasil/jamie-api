import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from 'src/menus/entities/menu.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateMenuItemInput } from './inputs/create-menu-item.input';
import { MenuItem } from './entities/menu-item.entity';
import { plainToClass } from 'class-transformer';
import { UpdateMenuItemInput } from './inputs/update-menu-item.input';
import { DeleteMenuItemInput } from './inputs/delete-menu-item.input';
import { InputAction } from 'src/common/schema/enums/input-action.enum';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}
  async create(menu: Menu, input: CreateMenuItemInput, manager: EntityManager) {
    const { children, ...rest } = input;
    const item = manager.getRepository(MenuItem).create({
      ...rest,
      menu,
      menuId: menu.id,
    });

    const saved = await manager.save(item);
    if (children?.length) {
      await Promise.all(
        children.map(async (child) => {
          child.parentId = saved.id;
          await this.create(menu, child, manager);
        }),
      );
    }
  }

  findAll(query: any) {
    // return `This action returns all menu items`;
    return this.menuItemRepository.find({
      where: [{ menu: { id: query.menuId } }],
    });
  }

  findOne(id: number) {
    return this.menuItemRepository.findOneBy({ id: id });
  }

  async update(menu: Menu, input: UpdateMenuItemInput, manager: EntityManager) {
    const { children } = input;
    delete input.action;
    delete input.children;
    const item = await manager.save(MenuItem, {
      ...input,
      menu,
      menuId: menu.id,
    });
    if (children?.length) {
      await Promise.all(
        children.map(async (child) => {
          switch (child.action) {
            case InputAction.CREATE:
              child.parentId = item.id;
              return this.create(menu, child as CreateMenuItemInput, manager);
            case InputAction.UPDATE:
              return this.update(menu, child as UpdateMenuItemInput, manager);
            case InputAction.DELETE:
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
      case InputAction.CREATE:
        return this.create(menu, input as CreateMenuItemInput, manager);
      case InputAction.UPDATE:
        return this.update(menu, input as UpdateMenuItemInput, manager);
      case InputAction.DELETE:
        return this.remove(input as DeleteMenuItemInput, manager);
      default:
        throw new Error('unexpected action');
    }
  }
}
