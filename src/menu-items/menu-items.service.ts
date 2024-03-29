import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from 'src/menus/entities/menu.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateMenuItemInput } from './inputs/create-menu-item.input';
import { MenuItem } from './entities/menu-item.entity';
import { UpdateMenuItemInput } from './inputs/update-menu-item.input';
import { DeleteMenuItemInput } from './inputs/delete-menu-item.input';
import { InputAction } from 'src/common/schema/enums/input-action.enum';
import { EntityNotFoundError } from 'src/common/errors/entity-not-found.error';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { BadTemplateFormatError } from 'src/menus/errors/bad-template-format.error';
import { RenderMenuItemTemplateInput } from 'src/menus/inputs/render-menu-item-template.input';
import TemplateHelpers from 'src/common/helpers/template.helper';
import { RenderMenuTemplateInput } from 'src/menus/inputs/render-menu-template.input';

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
    isChildren = false,
    childrenIndex: number[],
    siblings: CreateMenuItemInput[],
  ) {
    const { children, ...rest } = input;
    const item = manager.getRepository(MenuItem).create({
      ...rest,
    });

    const saved = await manager.save(MenuItem, {
      ...item,
      menuId: menu.id,
      index,
      isChildren,
      childrenIndex,
      siblings,
    });
    if (children?.length) {
      await Promise.all(
        children.map(async (child, i) => {
          child.parentId = saved.id;
          await this.create(
            menu,
            child,
            manager,
            index,
            true,
            [...childrenIndex, i],
            children.filter((c, index2) => i !== index2),
          );
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

  findOne(id: number, menuId: number) {
    return this.menuItemRepository.findOneBy({ id, menuId });
  }

  async update(
    menu: Menu,
    input: UpdateMenuItemInput,
    manager: EntityManager,
    index: number,
    isChildren,
    childrenIndex: number[],
    siblings: UpdateMenuItemInput[],
  ) {
    const { children, template, templateFormat } = input;
    delete input.action;
    delete input.children;
    let existingItem;
    try {
      existingItem = await manager.getRepository(MenuItem).findOneOrFail({
        where: { id: input.id, menuId: menu.id },
        relations: ['children'],
      });
    } catch (error) {
      throw new EntityNotFoundError(MenuItem, input.id);
    }
    if (template) {
      if (
        (templateFormat && templateFormat === TemplateFormat.JSON) ||
        (!templateFormat && existingItem.templateFormat === TemplateFormat.JSON)
      ) {
        const inputChildren = await existingItem.children;
        const inputItem: RenderMenuItemTemplateInput = {
          ...existingItem,
          template,
          templateFormat: TemplateFormat.JSON,
          children: inputChildren,
        };
        const inputMenu: RenderMenuTemplateInput = {
          ...menu,
          items: [inputItem],
        };
        try {
          const renderedTemplate = TemplateHelpers.renderMenuItemTemplate(
            inputItem,
            inputMenu,
          );
          JSON.parse(renderedTemplate);
        } catch (err) {
          throw new BadTemplateFormatError(err);
        }
      }
    }
    const item = await manager.save(MenuItem, {
      ...input,
      menuId: menu.id,
      index,
      isChildren,
      childrenIndex,
      siblings,
    });
    if (children?.length) {
      await Promise.all(
        children.map(async (child, i) => {
          switch (child.action) {
            case InputAction.CREATE:
              child.parentId = item.id;
              return this.create(
                menu,
                child as CreateMenuItemInput,
                manager,
                index,
                true,
                [...childrenIndex, i],
                children.filter(
                  (c, index2) => i !== index2,
                ) as CreateMenuItemInput[],
              );
            case InputAction.UPDATE:
              return this.update(
                menu,
                child as UpdateMenuItemInput,
                manager,
                index,
                true,
                [...childrenIndex, i],
                children.filter((c, index2) => i !== index2),
              );
            case InputAction.DELETE:
              return this.remove(menu, child as DeleteMenuItemInput, manager);
            default:
              throw new Error('unexpected action');
          }
        }),
      );
    }
  }

  async remove(menu: Menu, input: DeleteMenuItemInput, manager: EntityManager) {
    try {
      const item = await manager
        .getRepository(MenuItem)
        .findOneOrFail({ where: { id: input.id, menuId: menu.id } });
      await manager.remove(item);
      return true;
    } catch (err) {
      throw new EntityNotFoundError(MenuItem, input.id);
    }
  }

  handle(
    menu: Menu,
    input: CreateMenuItemInput | UpdateMenuItemInput | DeleteMenuItemInput,
    manager: EntityManager,
    index: number,
    siblings: CreateMenuItemInput[] | UpdateMenuItemInput[],
  ) {
    switch (input.action) {
      case InputAction.CREATE:
        return this.create(
          menu,
          input as CreateMenuItemInput,
          manager,
          index,
          false,
          [],
          siblings as CreateMenuItemInput[],
        );
      case InputAction.UPDATE:
        return this.update(
          menu,
          input as UpdateMenuItemInput,
          manager,
          index,
          false,
          [],
          siblings as UpdateMenuItemInput[],
        );
      case InputAction.DELETE:
        return this.remove(menu, input as DeleteMenuItemInput, manager);
      default:
        throw new Error('unexpected action');
    }
  }
}
