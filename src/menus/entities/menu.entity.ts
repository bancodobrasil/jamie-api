import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Connection } from 'src/common/schema/objects/connection.object';
import MetaScalar from 'src/common/schema/scalars/meta.scalar';
import { IMenuMeta } from 'src/common/types';
import { MenuItem } from 'src/menu-items/entities/menu-item.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('menus')
export class Menu {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => [MetaScalar])
  @Column('text', {
    transformer: { from: JSON.parse, to: JSON.stringify },
  })
  meta: IMenuMeta[];

  @Field(() => [MenuItem], { nullable: true })
  @OneToMany(() => MenuItem, (menuItem) => menuItem.menu, {
    lazy: true,
    cascade: true,
  })
  items?: MenuItem[];
}

@ObjectType()
export class MenuConnection extends Connection(Menu) {}

export enum MenuSort {
  Id = 'id',
  Name = 'name',
}
registerEnumType(MenuSort, { name: 'MenuSort' });
