import { Field, Int, ObjectType } from '@nestjs/graphql';
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

  @Field(() => [MenuItem], { nullable: true })
  @OneToMany(() => MenuItem, (menuItem) => menuItem.menu, { lazy: true })
  items?: Promise<MenuItem[]>;
}
