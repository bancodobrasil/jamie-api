import { Logger } from '@nestjs/common';
import FieldValidationError from 'src/common/errors/field-validation.error';
import { InputAction } from 'src/common/schema/enums/input-action.enum';
import { WithAction, MenuMetaType } from 'src/common/types';
import { Menu } from 'src/menus/entities/menu.entity';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { MenuItem } from '../menu-item.entity';

@EventSubscriber()
export class MenuItemSubscriber implements EntitySubscriberInterface<MenuItem> {
  private readonly logger = new Logger(MenuItemSubscriber.name);

  listenTo() {
    return MenuItem;
  }

  async beforeInsert(event: InsertEvent<MenuItem>) {
    const { index, isChildren, childrenIndex, siblings, menuId } =
      event.entity as any;
    if (!event.entity.menu) {
      const menu = await event.manager.findOne(Menu, { where: { id: menuId } });
      event.entity.menu = menu;
    }
    await this.validateMenuItem(
      event.entity,
      siblings,
      index,
      isChildren,
      childrenIndex,
    );
    event.entity = await this.setMeta(event.entity);
    await this.validateMeta(event.entity, index, isChildren, childrenIndex);
    await this.setId(event.entity);
  }

  async afterInsert(event: InsertEvent<MenuItem>): Promise<any> {
    const { children } = event.entity;
    if (!children) return;
    await Promise.all(
      children.map(async (child) => {
        child.parentId = event.entity.id;
        await event.manager.save(MenuItem, child);
      }),
    );
  }

  async beforeUpdate(event: UpdateEvent<MenuItem>) {
    const { index, isChildren, childrenIndex, siblings, menuId } = event.entity;
    const menu = await event.manager.findOne(Menu, { where: { id: menuId } });
    const { databaseEntity } = event;
    let menuItem = { ...databaseEntity, ...event.entity, menu };
    await this.validateMenuItem(
      menuItem,
      siblings,
      index,
      isChildren,
      childrenIndex,
    );
    menuItem = await this.setMeta(menuItem);
    event.entity.meta = menuItem.meta;
    await this.validateMeta(menuItem, index, isChildren, childrenIndex);
  }

  private async setId(menuItem: MenuItem) {
    if (menuItem.id) return;
    const menu = await menuItem.menu;
    const allItems = [];
    const items = await menu.items;
    await Promise.all(
      items.map(async (i) => {
        const children = await i.children;
        allItems.push(...[i, ...(children || [])]);
      }),
    );
    let lastId = allItems.reduce((acc, i) => (i.id > acc ? i.id : acc), 0);
    menuItem.id = ++lastId;
    const setChildrenId = (children: MenuItem[]) => {
      children.forEach((c) => {
        c.id = ++lastId;
        if (c.children) setChildrenId(c.children);
      });
    };
    if (menuItem.children) setChildrenId(menuItem.children);
  }

  private async validateMenuItem(
    menuItem: MenuItem,
    siblings: WithAction<MenuItem>[],
    index: number,
    isChildren: boolean,
    childrenIndex?: number[],
  ) {
    const menu = await menuItem.menu;
    const items = await menu.items;
    siblings = siblings || [];
    const allSiblings =
      items?.filter(
        (i) =>
          i.parentId === menuItem.parentId &&
          !siblings.find((s) => s.id === i.id),
      ) || [];
    siblings = [...siblings, ...allSiblings].filter(
      (s: WithAction<MenuItem>) => s.action !== InputAction.DELETE,
    );
    if (menuItem.id) siblings = siblings.filter((s) => s.id !== menuItem.id);
    const { IS_UNIQUE } = FieldValidationError.constraints;
    let errors = {};
    if (siblings.length) {
      const siblingNames = siblings.map((s) => s.label);
      if (siblingNames.includes(menuItem.label)) {
        errors['label'] = {
          errors: [
            `Menu Item labels must be unique within the same parent. Found repeated label: ${menuItem.label}`,
          ],
          constraints: [IS_UNIQUE],
        };
      }
      const siblingOrders = siblings.map((s) => s.order);
      if (siblingOrders.includes(menuItem.order)) {
        errors['order'] = {
          errors: [
            `Menu Item orders must be unique within the same parent. Found repeated order: ${menuItem.order}`,
          ],
          constraints: [IS_UNIQUE],
        };
      }
    }
    if (Object.keys(errors).length) {
      if (isChildren) {
        for (const i of childrenIndex) {
          errors = {
            [`children[${i}]`]: { ...errors },
          };
        }
      }
      throw new FieldValidationError({
        [`items[${index}]`]: {
          ...errors,
        },
      });
    }
  }

  private async setMeta(menuItem: MenuItem): Promise<MenuItem> {
    const menu = await menuItem.menu;
    if (!menu.meta?.length) return menuItem;
    const meta = {};
    menu.meta.forEach((m) => {
      if (menuItem.meta?.[m.id]) meta[m.id] = menuItem.meta[m.id];
      else if (menuItem.meta?.[m.name]) meta[m.id] = menuItem.meta[m.name];
      else if (m.defaultValue) meta[m.id] = m.defaultValue;
    });
    menuItem.meta = { ...meta };
    return menuItem;
  }

  private async validateMeta(
    menuItem: MenuItem,
    index: number,
    isChildren: boolean,
    childrenIndex?: number[],
  ): Promise<void> {
    const menu = await menuItem.menu;
    if (!menu.meta?.length) return;
    const missingRequiredMeta = [];
    menu.meta.forEach((m) => {
      if (
        m.required &&
        m.enabled &&
        m.type !== MenuMetaType.BOOLEAN &&
        !menuItem.meta?.[m.id]
      ) {
        missingRequiredMeta.push(m.name);
      }
    });
    if (missingRequiredMeta.length) {
      const { META_REQUIRED } = FieldValidationError.constraints;
      let errors: any = {
        meta: {
          errors: [`Missing required meta: ${missingRequiredMeta.join(', ')}`],
          constraints: [META_REQUIRED],
        },
      };
      if (isChildren) {
        for (const i of childrenIndex) {
          errors = {
            [`children[${i}]`]: { ...errors },
          };
        }
      }
      throw new FieldValidationError({
        [`items[${index}]`]: {
          ...errors,
        },
      });
    }
  }
}
