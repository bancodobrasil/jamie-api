import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'src/common/graphql/types/json.type';
import { Menu } from 'src/menus/entities/menu.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
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

  @Field(() => GraphQLJSONObject, { nullable: true })
  meta?: object;

  @Field(() => MenuItem, { nullable: true })
  @OneToMany(() => MenuItem, (menuItem) => menuItem.parent)
  children?: MenuItem[];

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.children)
  @JoinColumn()
  parent?: MenuItem;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  parentId?: number;

  @ManyToOne(() => Menu, (menu) => menu.items)
  @JoinColumn()
  menu?: Menu;
}
