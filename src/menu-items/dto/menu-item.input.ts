import { Field, InputType, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'src/common/scalars/json.scalar';
import { IMenuItemMeta } from 'src/common/types';

export enum MenuItemAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

@InputType()
export class MenuItemInput {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field()
  label: string;

  @Field()
  action: MenuItemAction;

  @Field(() => Int)
  order: number;

  @Field(() => GraphQLJSONObject)
  meta: IMenuItemMeta;

  @Field(() => Int, { nullable: true })
  parentId?: number;

  @Field(() => [MenuItemInput], { nullable: true })
  children?: MenuItemInput[];
}
