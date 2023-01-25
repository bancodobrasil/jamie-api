import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import MetaScalar from 'src/common/scalars/meta.scalar';
import { IMenuMeta } from 'src/common/types';
import { MenuItemInput } from 'src/menu-items/dto/menu-item.input';

@InputType()
export class CreateMenuInput {
  @Field()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @Field(() => [MetaScalar])
  meta: IMenuMeta[];

  @Field(() => [MenuItemInput], { nullable: true })
  items?: MenuItemInput[];
}
