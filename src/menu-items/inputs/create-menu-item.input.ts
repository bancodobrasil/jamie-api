import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsObject,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { GraphQLJSONObject } from 'src/common/schema/scalars/json.scalar';
import { IMenuItemMeta, MenuItemAction } from 'src/common/types';

@InputType()
export class CreateMenuItemInput {
  readonly action = MenuItemAction.CREATE;

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

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  enabled?: boolean;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  startTime?: Date;


  @Field(() => Date, { nullable: true })
  @IsOptional()
  endTime?: Date;



  
}
