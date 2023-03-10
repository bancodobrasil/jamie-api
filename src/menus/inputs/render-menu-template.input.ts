import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import GraphQLJSON from 'src/common/schema/scalars/json.scalar';
import { MenuMetaType } from 'src/common/types';
import { RenderMenuItemTemplateInput } from './render-menu-item-template.input';

@InputType()
export class RenderMenuTemplateInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  template: string;

  @Field(() => String)
  @IsEnum(TemplateFormat)
  templateFormat: TemplateFormat;

  @Field(() => [MenuMetaInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuMetaInput)
  meta?: MenuMetaInput[];

  @Field(() => [RenderMenuItemTemplateInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RenderMenuItemTemplateInput)
  items?: RenderMenuItemTemplateInput[];
}

@InputType()
class MenuMetaInput {
  @Field(() => Int)
  @IsDefined()
  id: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsEnum(MenuMetaType)
  type: MenuMetaType;

  @Field(() => Boolean)
  @IsDefined()
  @IsBoolean()
  required: boolean;

  @Field(() => Int)
  @IsDefined()
  order: number;

  @Field(() => Boolean)
  @IsDefined()
  @IsBoolean()
  enabled: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @ValidateIf((o) => o.required)
  @IsDefined()
  @IsNotEmpty()
  defaultValue?: any;
}
