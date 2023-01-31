import { Field, InputType, Int } from '@nestjs/graphql';
import { IsDefined } from 'class-validator';
import { MenuItemAction } from 'src/common/types';

@InputType()
export class DeleteMenuItemInput {
  readonly action = MenuItemAction.DELETE;

  @Field(() => Int)
  @IsDefined()
  id: number;
}
