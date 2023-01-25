import { Field, Int, ObjectType } from '@nestjs/graphql';
import FieldValidationError from 'src/common/errors/field-validation.error';
import { GraphQLJSONObject } from 'src/common/scalars/json.scalar';
import { IMenuItemMeta } from 'src/common/types';
import { Menu } from 'src/menus/entities/menu.entity';
import {
  Column,
  Entity,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateEvent,
} from 'typeorm';

@ObjectType()
@Entity('menu_items')
export class MenuItem {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  label: string;

  @Field(() => Int)
  @Column()
  order: number;

  @Field(() => GraphQLJSONObject)
  @Column('text', {
    transformer: { from: JSON.parse, to: JSON.stringify },
  })
  meta: IMenuItemMeta;

  @Field(() => [MenuItem], { nullable: true })
  @OneToMany(() => MenuItem, (menuItem) => menuItem.parent, {
    lazy: true,
    cascade: true,
  })
  children?: MenuItem[];

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.children, { lazy: true })
  @JoinColumn()
  parent?: MenuItem;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  parentId?: number;

  @ManyToOne(() => Menu, (menu) => menu.items, { lazy: true })
  @JoinColumn()
  menu?: Menu;

  async validateMeta(index: number): Promise<void> {
    const menu = await this.menu;
    const menuMeta = menu?.meta || [];
    const missingRequiredMeta = [];
    menuMeta.forEach((m) => {
      if (m.required && !this.meta[m.name]) {
        missingRequiredMeta.push(m.name);
      }
    });
    if (missingRequiredMeta.length) {
      throw new FieldValidationError({
        items: {
          [index]: {
            meta: {
              errors: [
                `Missing required meta: ${missingRequiredMeta.join(', ')}`,
              ],
              constraints: ['requiredMeta'],
            },
          },
        },
      });
    }
  }
}

@EventSubscriber()
export class MenuItemSubscriber implements EntitySubscriberInterface<MenuItem> {
  listenTo() {
    return MenuItem;
  }
  beforeInsert(event: InsertEvent<MenuItem>) {
    this.setMenu(event.entity);
  }
  beforeUpdate(event: UpdateEvent<MenuItem>) {
    this.setMenu(event.databaseEntity);
  }
  private async setMenu(item: MenuItem): Promise<void> {
    let menu = await item.menu;
    if (!menu) {
      const parent = await item.parent;
      if (parent) {
        menu = await parent.menu;
        item.menu = menu;
        if (item.children?.length) {
          item.children = item.children.map((child) => {
            child.menu = menu;
            return child;
          });
        }
      }
    }
  }
}
