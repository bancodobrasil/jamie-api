import { InputType, Field, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'src/common/graphql/types/json.type';

@InputType()
export class CreateMenuItemInput {
  @Field()
  label: string;

  @Field(() => Int)
  order: number;

  @Field(() => [CreateMenuItemInput], { nullable: true })
  children?: CreateMenuItemInput[];

  @Field(() => GraphQLJSONObject, { nullable: true })
  meta?: object;
}
