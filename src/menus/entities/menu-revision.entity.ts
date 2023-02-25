import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Menu } from './menu.entity';

@ObjectType()
@Entity('menu_revisions')
export class MenuRevision {
  @Field(() => Int)
  @PrimaryColumn()
  id: number;

  @Field(() => Int)
  @PrimaryColumn()
  menuId: number;

  @Field()
  @Column('text')
  description: string;

  @Field()
  @Column('text')
  snapshot: string;

  @Field(() => Menu)
  @ManyToOne(() => Menu, (menu) => menu.revisions, {
    lazy: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  menu: Menu;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;
}
