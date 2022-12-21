import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateMenuInput {
  @Field()
  name: string;
}
