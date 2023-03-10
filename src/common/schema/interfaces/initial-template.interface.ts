import { Field, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export abstract class InitialTemplate {
  @Field(() => String)
  JSON: string;

  @Field(() => String)
  XML: string;

  @Field(() => String)
  PLAIN: string;
}
