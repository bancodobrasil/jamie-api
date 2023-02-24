import { Field, InputType, Int, OmitType, PartialType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsOptional,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { MenuItemAction } from 'src/common/types';
import { CreateMenuItemInput } from './create-menu-item.input';

@InputType()
export class UpdateMenuItemInput extends PartialType(
  OmitType(CreateMenuItemInput, ['children', 'action']),
) {
  @Field()
  @IsDefined()
  @IsEnum(MenuItemAction)
  action: MenuItemAction;

  @Field(() => Int, { nullable: true })
  @ValidateIf(
    (o) =>
      o.action === MenuItemAction.UPDATE || o.action === MenuItemAction.DELETE,
  )
  @IsDefined()
  id?: number;

  @Field(() => [UpdateMenuItemInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMenuItemInput)
  children?: UpdateMenuItemInput[];

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
