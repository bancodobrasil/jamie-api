import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { Connection } from 'src/common/schema/objects/connection.object';
import { MenuMeta } from 'src/menus/objects/menu-meta.object';
import { MenuItem } from 'src/menu-items/entities/menu-item.entity';
import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MenuRevision } from './menu-revision.entity';
import { VersionedTimestamped } from 'src/common/schema/objects/versioned-timestamped.object';
import MenuInitialTemplate from '../objects/menu-initial-template.object';
import { MenuPendency } from './menu-pendency.entity';

@ObjectType()
@Entity('menus')
export class Menu extends VersionedTimestamped {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => ID)
  @Column({ unique: true })
  @Generated('uuid')
  uuid: string;

  @Field()
  @Column()
  name: string;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  hasConditions: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  mustDeferChanges: boolean;

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

  @Field(() => MenuInitialTemplate)
  defaultTemplate: MenuInitialTemplate = new MenuInitialTemplate();

  @Field(() => [MenuItem], { nullable: true })
  @OneToMany(() => MenuItem, (menuItem) => menuItem.menu, {
    lazy: true,
    cascade: true,
  })
  items?: MenuItem[];

  @Field(() => [MenuPendency], { nullable: true })
  @OneToMany(() => MenuPendency, (pendency) => pendency.menu, {
    lazy: true,
    cascade: true,
  })
  pendencies?: MenuPendency[];

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

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  currentRevisionId?: number;

  @Field(() => MenuRevision, { nullable: true })
  @ManyToOne(() => MenuRevision, {
    nullable: true,
    eager: true,
    cascade: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  publishedRevision?: MenuRevision;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  publishedRevisionId?: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  rulesheetId?: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  featwsVersion?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  parameters?: string;
}

@ObjectType()
export class MenuConnection extends Connection(Menu) {}

export enum MenuSort {
  Id = 'id',
  Name = 'name',
}
registerEnumType(MenuSort, { name: 'MenuSort' });
