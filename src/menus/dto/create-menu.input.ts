import { Field, InputType } from '@nestjs/graphql';
import MetaScalar from 'src/common/scalars/meta.scalar';
import { IMenuMeta } from 'src/common/types';
import { MenuItemInput } from 'src/menu-items/dto/menu-item.input';

@InputType()
export class CreateMenuInput {
  @Field()
  name: string;

  @Field(() => [MetaScalar], { nullable: true })
  meta?: IMenuMeta[];

  @Field(() => [MenuItemInput], { nullable: true })
  items?: MenuItemInput[];
}
