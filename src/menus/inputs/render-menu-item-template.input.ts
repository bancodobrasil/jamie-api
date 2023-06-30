import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { GraphQLJSONObject } from 'src/common/schema/scalars/json.scalar';

@InputType()
export class RenderMenuItemTemplateInput {
  @Field(() => Int)
  @IsDefined()
  id: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  label: string;

  @Field(() => Int)
  @IsDefined()
  order: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  template?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(TemplateFormat)
  templateFormat?: TemplateFormat;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  meta?: Record<number, unknown>;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  parentId?: number;

  @Field(() => [RenderMenuItemTemplateInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RenderMenuItemTemplateInput)
  children?: RenderMenuItemTemplateInput[];

  @Field(() => Boolean, { nullable: false })
  @IsDefined()
  @IsBoolean()
  enabled: boolean;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  startPublication?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  endPublication?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  rules?: string;
}
