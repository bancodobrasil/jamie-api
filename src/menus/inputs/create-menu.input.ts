import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateMenuItemInput } from 'src/menu-items/inputs/create-menu-item.input';
import { CreateMenuMetaInput } from './create-menu-meta.input';

@InputType()
export class CreateMenuInput {
  @Field()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  hasConditions?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  mustDeferChanges?: boolean;

  @Field(() => [CreateMenuMetaInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMenuMetaInput)
  meta?: CreateMenuMetaInput[];

  @Field(() => [CreateMenuItemInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMenuItemInput)
  items?: CreateMenuItemInput[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  rulesheetId?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  parameters?: string;
}
