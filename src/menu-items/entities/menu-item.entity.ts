import { UnprocessableEntityException } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'src/common/scalars/json.scalar';
import { IMenuItemMeta } from 'src/common/types';
import { Menu } from 'src/menus/entities/menu.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { format } from 'util';

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

  @Field(() => MenuItem, { nullable: true })
  @OneToMany(() => MenuItem, (menuItem) => menuItem.parent, { lazy: true })
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

  async validateMeta(): Promise<void> {
    const menu = await this.menu;
    const menuMeta = menu?.meta || [];
    const missingRequiredMeta = [];
    menuMeta.forEach((m) => {
      if (m.required && !this.meta[m.name]) {
        missingRequiredMeta.push(m.name);
      }
    });
    if (missingRequiredMeta.length) {
      const menuItem = {
        id: this.id,
        parentId: this.parentId,
        label: this.label,
        meta: this.meta,
      };
      Object.keys(menuItem).forEach(
        (key) => menuItem[key] === undefined && delete menuItem[key],
      );
      throw new UnprocessableEntityException(
        `MenuItem: ${format(
          menuItem,
        )} missing required meta: ${missingRequiredMeta.join(', ')}`,
      );
    }
  }
}
