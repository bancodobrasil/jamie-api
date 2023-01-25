import { Field, InputType, Int, OmitType, PartialType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { UpdateMenuItemInput } from 'src/menu-items/dto/update-menu-item.input';
import { CreateMenuInput } from './create-menu.input';

@InputType()
export class UpdateMenuInput extends PartialType(
  OmitType(CreateMenuInput, ['items']),
) {
  @Field(() => Int)
  id: number;

  @Field(() => [UpdateMenuItemInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMenuItemInput)
  items?: UpdateMenuItemInput[];
}
