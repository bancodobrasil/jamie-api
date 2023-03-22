import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Connection } from 'src/common/schema/objects/connection.object';
import { KeycloakUser } from 'src/common/schema/objects/keycloak-user.object';
import { GraphQLJSONObject } from 'src/common/schema/scalars/json.scalar';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UpdateMenuInput } from '../inputs/update-menu.input';
import { Menu } from './menu.entity';

@ObjectType()
@Entity('menu_pendencies')
export class MenuPendency {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @PrimaryColumn()
  menuId: number;

  @Field(() => KeycloakUser)
  @Column('text', { transformer: { from: JSON.parse, to: JSON.stringify } })
  submittedBy: KeycloakUser;

  @Field(() => GraphQLJSONObject)
  @Column('text', { transformer: { from: JSON.parse, to: JSON.stringify } })
  input: UpdateMenuInput;

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

@ObjectType()
export class MenuPendencyConnection extends Connection(MenuPendency) {}
