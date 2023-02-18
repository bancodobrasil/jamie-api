import { Logger } from '@nestjs/common';
import FieldValidationError from 'src/common/errors/field-validation.error';
import { MenuMetaType } from 'src/common/types';
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
    const { index, isChildren, childrenIndex, siblings } = event.entity as any;
    await this.validateMenuItem(
      event.entity,
      siblings,
      index,
      isChildren,
      childrenIndex,
    );
    event.entity = await this.setMetaIds(event.entity);
    await this.validateMeta(event.entity, index, isChildren, childrenIndex);
  }

  async beforeUpdate(event: UpdateEvent<MenuItem>) {
    const { index, isChildren, childrenIndex, siblings } = event.entity;
    const { databaseEntity } = event;
    let menuItem = { ...databaseEntity, ...event.entity };
    await this.validateMenuItem(
      menuItem,
      siblings,
      index,
      isChildren,
      childrenIndex,
    );
    menuItem = await this.setMetaIds(menuItem);
    event.entity.meta = menuItem.meta;
    await this.validateMeta(menuItem, index, isChildren, childrenIndex);
    await event.manager.save(MenuItem, event.entity);
  }

  private async validateMenuItem(
    menuItem: MenuItem,
    siblings: MenuItem[],
    index: number,
    isChildren: boolean,
    childrenIndex?: number[],
  ) {
    this.logger.log('validateMenuItem');
    const menu = await menuItem.menu;
    const items = await menu.items;
    const allSiblings = items.filter(
      (i) =>
        i.parentId === menuItem.parentId &&
        !siblings.find((s) => s.id === i.id),
    );
    siblings = [...siblings, ...allSiblings];
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

  private async setMetaIds(menuItem: MenuItem): Promise<MenuItem> {
    const menu = await menuItem.menu;
    if (!menu.meta?.length) return;
    const meta = {};
    menu.meta.forEach((m) => {
      if (menuItem.meta?.[m.id]) meta[m.id] = menuItem.meta[m.id];
      if (menuItem.meta?.[m.name]) meta[m.id] = menuItem.meta[m.name];
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
