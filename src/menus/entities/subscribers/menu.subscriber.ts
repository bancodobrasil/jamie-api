import FieldValidationError from 'src/common/errors/field-validation.error';
import { MenuItem } from 'src/menu-items/entities/menu-item.entity';
import { MenuMeta } from 'src/menus/objects/menu-meta.object';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Menu } from '../menu.entity';

@EventSubscriber()
export class MenuSubscriber implements EntitySubscriberInterface<Menu> {
  listenTo() {
    return Menu;
  }

  beforeInsert(event: InsertEvent<Menu>): void {
    const { meta } = event.entity;
    if (meta?.length) {
      this.validateMeta(meta);
    }
  }

  beforeUpdate(event: UpdateEvent<Menu>): void {
    const { meta } = event.entity;
    if (meta?.length) {
      this.validateMeta(meta);
    }
  }

  async afterInsert(event: InsertEvent<Menu>) {
    const menu = await this.setMenu(event.entity);
    await event.manager.save(menu, { reload: true });
  }

  private validateMeta(meta: MenuMeta[]) {
    const metaWithIndex = meta.map((m, index) => ({ ...m, index }));
    const repeatedMetaIds = metaWithIndex.filter((m) => {
      return metaWithIndex.find((m2) => m2.id === m.id && m2.index !== m.index);
    });
    const repeatedMetaNames = metaWithIndex.filter((m) => {
      return metaWithIndex.find(
        (m2) => m2.name === m.name && m2.index !== m.index,
      );
    });
    const repeatedMetaOrders = metaWithIndex.filter((m) => {
      return metaWithIndex.find(
        (m2) => m2.order === m.order && m2.index !== m.index,
      );
    });
    if (
      !repeatedMetaIds.length &&
      !repeatedMetaNames.length &&
      !repeatedMetaOrders.length
    ) {
      return;
    }
    const errors = {};
    metaWithIndex.forEach((m) => {
      if (repeatedMetaIds.find((m2) => m2.id === m.id)) {
        errors[`meta[${m.index}]`] = {
          ...errors[`meta[${m.index}]`],
          id: {
            errors: `Menu meta ids must be unique. Found repeated id: ${m.id}`,
          },
        };
      }
      if (repeatedMetaNames.find((m2) => m2.id === m.id)) {
        errors[`meta[${m.index}]`] = {
          ...errors[`meta[${m.index}]`],
          name: {
            errors: `Menu meta names must be unique. Found repeated name: ${m.name}`,
          },
        };
      }
      if (repeatedMetaOrders.find((m2) => m2.id === m.id)) {
        errors[`meta[${m.index}]`] = {
          ...errors[`meta[${m.index}]`],
          order: {
            errors: `Menu meta orders must be unique. Found repeated order: ${m.order}`,
          },
        };
      }
    });
    throw new FieldValidationError(errors);
  }

  private async setMenu(menu: Menu): Promise<Menu> {
    const items = await menu.items;
    if (items?.length) {
      const setMenuOnItems = async (items: MenuItem[]) => {
        return Promise.all(
          items.map(async (item) => {
            item.menuId = menu.id;
            const children = await item.children;
            if (children?.length) {
              item.children = await setMenuOnItems(children);
            }
            return item;
          }),
        );
      };
      menu.items = await setMenuOnItems(items);
    }
    return menu;
  }
}
