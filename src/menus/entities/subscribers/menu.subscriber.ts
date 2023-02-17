import FieldValidationError from 'src/common/errors/field-validation.error';
import { MenuItem } from 'src/menu-items/entities/menu-item.entity';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  ObjectLiteral,
  UpdateEvent,
} from 'typeorm';
import { Menu } from '../menu.entity';

@EventSubscriber()
export class MenuSubscriber implements EntitySubscriberInterface<Menu> {
  listenTo() {
    return Menu;
  }

  beforeInsert(event: InsertEvent<Menu>): void {
    this.validateMeta(event.entity);
  }

  beforeUpdate(event: UpdateEvent<Menu>): void {
    this.validateMeta(event.entity, event.databaseEntity);
  }

  async afterInsert(event: InsertEvent<Menu>) {
    const menu = await this.setMenu(event.entity);
    await event.manager.save(menu, { reload: true });
  }

  private validateMeta(
    entity: ObjectLiteral | Menu,
    databaseEntity?: Menu,
  ): void {
    if (!entity.meta) return;
    const metaWithIndex = entity.meta.map((m, index) => ({ ...m, index }));
    const errors = {};
    // Check if ids are unique
    metaWithIndex
      .filter((m) => {
        return metaWithIndex.find(
          (m2) => m2.id === m.id && m2.index !== m.index,
        );
      })
      .forEach((m) => {
        errors[`meta[${m.index}]`] = {
          ...errors[`meta[${m.index}]`],
          id: {
            errors: `Menu meta ids must be unique. Found repeated id: ${m.id}`,
          },
        };
      });
    // Check if names are unique
    metaWithIndex
      .filter((m) => {
        return metaWithIndex.find(
          (m2) => m2.name === m.name && m2.index !== m.index,
        );
      })
      .forEach((m) => {
        errors[`meta[${m.index}]`] = {
          ...errors[`meta[${m.index}]`],
          id: {
            errors: `Menu meta names must be unique. Found repeated name: ${m.name}`,
          },
        };
      });
    // Check if orders are unique
    metaWithIndex
      .filter((m) => {
        return metaWithIndex.find(
          (m2) => m2.order === m.order && m2.index !== m.index,
        );
      })
      .forEach((m) => {
        errors[`meta[${m.index}]`] = {
          ...errors[`meta[${m.index}]`],
          id: {
            errors: `Menu meta orders must be unique. Found repeated order: ${m.order}`,
          },
        };
      });
    if (databaseEntity) {
      // Is an update
      const dbMeta = databaseEntity.meta;
      // Check if types have changed
      metaWithIndex
        .filter((m) => {
          const dbMetaItem = dbMeta.find((m2) => m2.id === m.id);
          return dbMetaItem?.type !== m.type;
        })
        .forEach((m) => {
          errors[`meta[${m.index}]`] = {
            ...errors[`meta[${m.index}]`],
            type: {
              errors: `Menu meta types cannot be changed. Found changed type: ${m.type}`,
            },
          };
        });
    }
    if (Object.keys(errors).length) throw new FieldValidationError(errors);
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
