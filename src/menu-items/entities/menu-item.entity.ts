import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'src/common/graphql/types/json.type';

@ObjectType()
export class MenuItem {
  @Field(() => Int)
  id: number;

  @Field()
  label: string;

  @Field(() => Int)
  order: number;

  @Field(() => MenuItem, { nullable: true })
  children?: MenuItem[];

  @Field(() => GraphQLJSONObject, { nullable: true })
  meta?: object;
}
