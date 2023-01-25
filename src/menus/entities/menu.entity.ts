import { Field, Int, ObjectType } from '@nestjs/graphql';
import MetaScalar from 'src/common/scalars/meta.scalar';
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
  @OneToMany(() => MenuItem, (menuItem) => menuItem.menu, { lazy: true })
  items?: MenuItem[];
}
