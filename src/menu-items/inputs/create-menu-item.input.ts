import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDefined,
  IsObject,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { InputAction } from 'src/common/schema/enums/input-action.enum';
import { GraphQLJSONObject } from 'src/common/schema/scalars/json.scalar';

@InputType()
export class CreateMenuItemInput {
  readonly action = InputAction.CREATE;

  @Field()
  label: string;

  @Field(() => Int)
  @IsDefined()
  @Min(1)
  order: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  parentId?: number;

  @Field(() => [CreateMenuItemInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMenuItemInput)
  children?: CreateMenuItemInput[];

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
}
