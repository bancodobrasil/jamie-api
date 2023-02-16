import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { Connection } from 'src/common/schema/objects/connection.object';
import { MenuMeta } from 'src/menus/objects/menu-meta.object';
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

  @Field(() => [MenuMeta], { nullable: true })
  @Column('text', {
    transformer: { from: JSON.parse, to: JSON.stringify },
  })
  meta: MenuMeta[];

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  template?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  templateFormat?: TemplateFormat;

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
