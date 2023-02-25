import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { Connection } from 'src/common/schema/objects/connection.object';
import { MenuMeta } from 'src/menus/objects/menu-meta.object';
import { MenuItem } from 'src/menu-items/entities/menu-item.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MenuRevision } from './menu-revision.entity';
import { VersionedTimestamped } from 'src/common/schema/objects/versioned-timestamped.object';

@ObjectType()
@Entity('menus')
export class Menu extends VersionedTimestamped {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => [MenuMeta], { nullable: true })
  @Column('text', {
    nullable: true,
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

  @Field(() => [MenuRevision], { nullable: true })
  @OneToMany(() => MenuRevision, (revision) => revision.menu, {
    lazy: true,
    cascade: true,
  })
  revisions?: MenuRevision[];

  @Field(() => MenuRevision, { nullable: true })
  @ManyToOne(() => MenuRevision, {
    nullable: true,
    eager: true,
    cascade: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  currentRevision?: MenuRevision;
}

@ObjectType()
export class MenuConnection extends Connection(Menu) {}

export enum MenuSort {
  Id = 'id',
  Name = 'name',
}
registerEnumType(MenuSort, { name: 'MenuSort' });
