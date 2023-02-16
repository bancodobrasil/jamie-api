import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsDefined,
  IsObject,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { InputAction } from 'src/common/schema/enums/input-action.enum';
import { GraphQLJSONObject } from 'src/common/schema/scalars/json.scalar';
import { IMenuItemMeta } from 'src/common/types';

@InputType()
export class CreateMenuItemInput {
  readonly action = InputAction.CREATE;

  @Field()
  label: string;

  @Field(() => Int)
  @IsDefined()
  @Min(1)
  order: number;

  @Field(() => GraphQLJSONObject)
  @IsDefined()
  @IsObject()
  meta: IMenuItemMeta;

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
  @IsOptional()
  enabled?: boolean;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  startPublication?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  endPublication?: Date;
}
