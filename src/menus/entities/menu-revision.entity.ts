import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { MenuRevisionSnapshot } from '../objects/menu-revision-snapshot.object';
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

  @Field(() => MenuRevisionSnapshot)
  @Column('text', { transformer: { from: JSON.parse, to: JSON.stringify } })
  snapshot: MenuRevisionSnapshot;

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
