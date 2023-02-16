import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MenuMetaType } from 'src/common/types';
import { GraphQLJSON } from '../../common/schema/scalars/json.scalar';

@ObjectType()
export class MenuMeta {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  type: MenuMetaType;

  @Field(() => Boolean)
  required: boolean;

  @Field(() => Int)
  order: number;

  @Field(() => GraphQLJSON, { nullable: true })
  defaultValue?: any;
}
