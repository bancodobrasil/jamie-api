import { Field, InputType, Int, OmitType, PartialType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { UpdateMenuItemInput } from 'src/menu-items/inputs/update-menu-item.input';
import { CreateMenuInput } from './create-menu.input';
import { TemplateFormat } from '../../common/enums/template-format.enum';

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

  @Field(() => String, { nullable: true })
  @IsOptional()
  template?: string;

  @Field(() => String, { nullable: true })
  @ValidateIf(
    (o, value) =>
      (o.template !== undefined && o.template !== null) ||
      (value !== undefined && value !== null),
  )
  @IsEnum(TemplateFormat)
  templateFormat?: TemplateFormat;
}
