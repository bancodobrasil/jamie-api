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
  listenTo() {
    return MenuItem;
  }

  async beforeInsert(event: InsertEvent<MenuItem>) {
    event.entity = await this.setMetaIds(event.entity);
    await this.validateMeta(event.entity);
  }

  async beforeUpdate(event: UpdateEvent<MenuItem>) {
    const { databaseEntity } = event;
    let menuItem = event.manager.merge(MenuItem, databaseEntity, event.entity);
    menuItem = await this.setMetaIds(menuItem);
    await this.validateMeta(menuItem);
    event.entity.meta = menuItem.meta;
  }

  private async setMetaIds(menuItem: MenuItem): Promise<MenuItem> {
    const menu = await menuItem.menu;
    if (!menu.meta?.length) return;
    const meta = {};
    menu.meta.forEach((m) => {
      if (menuItem.meta?.[m.name]) meta[m.id] = menuItem.meta[m.name];
    });
    menuItem.meta = { ...menuItem.meta, ...meta };
    return menuItem;
  }

  private async validateMeta(menuItem: MenuItem): Promise<void> {
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
      const formattedId = menuItem.id ? `menuItem #${menuItem.id}` : 'menuItem';
      throw new FieldValidationError({
        [formattedId]: {
          meta: {
            errors: [
              `Missing required meta: ${missingRequiredMeta.join(', ')}`,
            ],
            constraints: ['requiredMeta'],
          },
        },
      });
    }
  }
}
