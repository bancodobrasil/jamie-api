import { MenuItem } from 'src/menu-items/entities/menu-item.entity';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Menu } from '../menu.entity';

@EventSubscriber()
export class MenuSubscriber implements EntitySubscriberInterface<Menu> {
  listenTo() {
    return Menu;
  }
  async afterInsert(event: InsertEvent<Menu>) {
    const menu = await this.setMenu(event.entity);
    await event.manager.save(menu, { reload: true });
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
