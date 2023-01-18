import { Field, InputType } from '@nestjs/graphql';
import { MenuItemInput } from 'src/menu-items/dto/menu-item.input';

@InputType()
export class CreateMenuInput {
  @Field()
  name: string;

  @Field(() => [MenuItemInput], { nullable: true })
  items?: MenuItemInput[];
}
