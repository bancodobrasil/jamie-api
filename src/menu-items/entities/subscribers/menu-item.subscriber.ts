import FieldValidationError from 'src/common/errors/field-validation.error';
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
    await this.validateMeta(event.entity);
  }
  async beforeUpdate(event: UpdateEvent<MenuItem>) {
    const menuItem = event.manager.merge(
      MenuItem,
      event.databaseEntity,
      event.entity,
    );
    await this.validateMeta(menuItem);
  }
  private async validateMeta(menuItem: MenuItem): Promise<void> {
    const menu = await menuItem.menu;
    const menuMeta = menu?.meta || [];
    const missingRequiredMeta = [];
    menuMeta.forEach((m) => {
      if (m.required && !menuItem.meta[m.name]) {
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
