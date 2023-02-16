import { Field, InputType, Int } from '@nestjs/graphql';
import { IsDefined } from 'class-validator';
import { InputAction } from 'src/common/schema/enums/input-action.enum';

@InputType()
export class DeleteMenuItemInput {
  readonly action = InputAction.DELETE;

  @Field(() => Int)
  @IsDefined()
  id: number;
}
