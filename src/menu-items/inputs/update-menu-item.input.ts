import { Field, InputType, Int, OmitType, PartialType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsOptional,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { InputAction } from 'src/common/schema/enums/input-action.enum';
import { CreateMenuItemInput } from './create-menu-item.input';

@InputType()
export class UpdateMenuItemInput extends PartialType(
  OmitType(CreateMenuItemInput, ['children', 'action', 'enabled']),
) {
  @Field(() => InputAction)
  @IsDefined()
  @IsEnum(InputAction)
  action: InputAction;

  @Field(() => Int, { nullable: true })
  @ValidateIf(
    (o) => o.action === InputAction.UPDATE || o.action === InputAction.DELETE,
  )
  @IsDefined()
  id?: number;

  @Field(() => [UpdateMenuItemInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMenuItemInput)
  children?: UpdateMenuItemInput[];

  @Field(() => Boolean, { nullable: true })
  @ValidateIf((o) => o.action === InputAction.CREATE)
  @IsDefined()
  @IsBoolean()
  enabled?: boolean;

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
