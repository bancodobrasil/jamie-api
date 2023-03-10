import { Field, Int, ObjectType } from '@nestjs/graphql';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { VersionedTimestamped } from 'src/common/schema/objects/versioned-timestamped.object';
import { GraphQLJSONObject } from 'src/common/schema/scalars/json.scalar';
import { IMenuItemMeta } from 'src/common/types';
import { Menu } from 'src/menus/entities/menu.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import MenuItemInitialTemplate from '../objects/menu-item-initial-template.object';

@ObjectType()
@Entity('menu_items')
export class MenuItem extends VersionedTimestamped {
  @Field(() => Int)
  @PrimaryColumn()
  id: number;

  @Field()
  @Column()
  label: string;

  @Field(() => Int)
  @Column()
  order: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column('text', {
    nullable: true,
    transformer: { from: JSON.parse, to: JSON.stringify },
  })
  meta?: IMenuItemMeta;

  @Field(() => [MenuItem], { nullable: true })
  @OneToMany(() => MenuItem, (menuItem) => menuItem.parent, {
    lazy: true,
    cascade: true,
  })
  children?: MenuItem[];

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.children, {
    lazy: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  parent?: MenuItem;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  parentId?: number;

  @Field(() => Menu)
  @ManyToOne(() => Menu, (menu) => menu.items, {
    lazy: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  menu: Menu;

  @Field(() => Int)
  @PrimaryColumn()
  menuId?: number;

  @Field(() => Boolean, { nullable: false })
  @Column({ nullable: false })
  enabled: boolean;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  startPublication?: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  endPublication?: Date;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  template?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  templateFormat?: TemplateFormat;

  @Field(() => MenuItemInitialTemplate)
  defaultTemplate: MenuItemInitialTemplate = new MenuItemInitialTemplate();
}
