import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class InitialTemplate {
  @Field(() => String)
  JSON: string;

  @Field(() => String)
  XML: string;

  @Field(() => String)
  PLAIN: string;
}
