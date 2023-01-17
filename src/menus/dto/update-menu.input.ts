import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { CreateMenuInput } from './create-menu.input';

@InputType()
export class UpdateMenuInput extends PartialType(CreateMenuInput) {
  @Field(() => Int)
  id: number;
}
