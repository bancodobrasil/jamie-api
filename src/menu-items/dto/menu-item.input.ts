import { Field, InputType, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'src/common/scalars/json.scalar';

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

  @Field(() => Int, { nullable: true })
  parentId?: number;

  @Field(() => [MenuItemInput], { nullable: true })
  children?: MenuItemInput[];

  @Field(() => GraphQLJSONObject, { nullable: true })
  meta?: object;
}
