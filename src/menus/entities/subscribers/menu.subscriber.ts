import FieldValidationError from 'src/common/errors/field-validation.error';
import { InputAction } from 'src/common/schema/enums/input-action.enum';
import { WithAction } from 'src/common/types';
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
    if (event.entity.meta) {
      this.validateMeta(event.entity.meta);
    }
  }

  beforeUpdate(event: UpdateEvent<Menu>): void {
    if (event.entity.meta) {
      this.validateMeta(event.entity.meta, event.databaseEntity.meta);
      const updatedMeta = event.databaseEntity.meta
        .map((dbMeta) => {
          const meta = event.entity.meta.find((m) => m.id === dbMeta.id);
          meta?.action !== InputAction.DELETE && delete meta.action;
          return { ...dbMeta, ...meta };
        })
        .filter((m) => m.action !== InputAction.DELETE);
      const newMeta = event.entity.meta
        .filter((m) => m.action === InputAction.CREATE)
        .map((m) => {
          delete m.action;
          return m;
        });
      event.entity.meta = [...updatedMeta, ...newMeta];
    }
  }

  async afterInsert(event: InsertEvent<Menu>) {
    let { items } = event.queryRunner.data;
    if (!items) return;
    const setChildrenIndex = (
      children,
      index: number,
      childrenIndex: number[] = [],
    ) => {
      return children.map((child, childIndex) => {
        delete child.action;
        child.index = index;
        child.isChildren = true;
        child.childrenIndex = [...childrenIndex, childIndex];
        child.siblings = children.filter((i, index2) => childIndex !== index2);
        if (child.children) {
          child.children = setChildrenIndex(child.children, index, [
            ...childrenIndex,
            childIndex,
          ]);
        }
        return child;
      });
    };
    items = items.map((item, index) => {
      delete item.action;
      item.index = index;
      item.siblings = items.filter((i, index2) => index !== index2);
      if (item.children) {
        item.children = setChildrenIndex(item.children, index);
      }
      return item;
    });
    event.entity.items = items;
    const menu = await this.setMenu(event.entity);
    await event.manager.save(menu);
  }

  private validateMeta(
    meta: WithAction<MenuMeta>[],
    dbMeta?: MenuMeta[],
  ): void {
    const metaWithIndex = meta.map((m, index) => ({ ...m, index }));
    const errors = {};
    const { IS_UNIQUE, META_TYPE_CANNOT_BE_CHANGED } =
      FieldValidationError.constraints;
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
            errors: [
              `Menu meta ids must be unique. Found repeated id: ${m.id}`,
            ],
            constraints: [IS_UNIQUE],
          },
        };
      });
    // Check if names are unique
    metaWithIndex
      .filter((m) => {
        return metaWithIndex.find(
          (m2) => !!m.name && m2.name === m.name && m2.index !== m.index,
        );
      })
      .forEach((m) => {
        errors[`meta[${m.index}]`] = {
          ...errors[`meta[${m.index}]`],
          name: {
            errors: [
              `Menu meta names must be unique. Found repeated name: ${m.name}`,
            ],
            constraints: [IS_UNIQUE],
          },
        };
      });
    // Check if orders are unique
    metaWithIndex
      .filter((m) => {
        return metaWithIndex.find(
          (m2) => !!m.order && m2.order === m.order && m2.index !== m.index,
        );
      })
      .forEach((m) => {
        errors[`meta[${m.index}]`] = {
          ...errors[`meta[${m.index}]`],
          order: {
            errors: [
              `Menu meta orders must be unique. Found repeated order: ${m.order}`,
            ],
            constraints: [IS_UNIQUE],
          },
        };
      });
    if (dbMeta) {
      // Is an update
      // Check if ids are unique
      metaWithIndex
        .filter((m) => {
          return (
            m.action === InputAction.CREATE &&
            dbMeta.find((m2) => m2.id === m.id)
          );
        })
        .forEach((m) => {
          errors[`meta[${m.index}]`] = {
            ...errors[`meta[${m.index}]`],
            id: {
              errors: [
                `Menu meta ids must be unique. Found repeated id: ${m.id}`,
              ],
              constraints: [IS_UNIQUE],
            },
          };
        });
      // Check if names are unique
      metaWithIndex
        .filter((m) => {
          const existing = dbMeta.find(
            (m2) => m2.name === m.name && m2.id !== m.id,
          );
          return (
            !!m.name &&
            existing &&
            !metaWithIndex.find(
              (m2) =>
                m2.id === existing.id &&
                (m2.name !== m.name || m2.action === InputAction.DELETE),
            )
          );
        })
        .forEach((m) => {
          errors[`meta[${m.index}]`] = {
            ...errors[`meta[${m.index}]`],
            name: {
              errors: [
                `Menu meta names must be unique. Found repeated name: ${m.name}`,
              ],
              constraints: [IS_UNIQUE],
            },
          };
        });
      // Check if orders are unique
      metaWithIndex
        .filter((m) => {
          const existing = dbMeta.find(
            (m2) => m2.order === m.order && m2.id !== m.id,
          );
          return (
            !!m.order &&
            existing &&
            !metaWithIndex.find(
              (m2) =>
                m2.id === existing.id &&
                (m2.order !== m.order || m2.action === InputAction.DELETE),
            )
          );
        })
        .forEach((m) => {
          errors[`meta[${m.index}]`] = {
            ...errors[`meta[${m.index}]`],
            order: {
              errors: [
                `Menu meta orders must be unique. Found repeated order: ${m.order}`,
              ],
              constraints: [IS_UNIQUE],
            },
          };
        });
      // Check if types have changed
      metaWithIndex
        .filter((m) => {
          const dbMetaItem = dbMeta.find((m2) => m2.id === m.id);
          return dbMetaItem && m.type && dbMetaItem.type !== m.type;
        })
        .forEach((m) => {
          errors[`meta[${m.index}]`] = {
            ...errors[`meta[${m.index}]`],
            type: {
              errors: [
                `Menu meta types cannot be changed. Found changed type: ${m.type}`,
              ],
              constraints: [META_TYPE_CANNOT_BE_CHANGED],
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
            item.menu = menu;
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
