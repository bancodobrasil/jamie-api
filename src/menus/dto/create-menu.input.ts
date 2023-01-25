import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import MetaScalar from 'src/common/scalars/meta.scalar';
import { CreateMenuItemInput } from 'src/menu-items/dto/create-menu-item.input';
import { MenuMetaInput } from './meta.input';

@InputType()
export class CreateMenuInput {
  @Field()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @Field(() => [MetaScalar])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuMetaInput)
  meta: MenuMetaInput[];

  @Field(() => [CreateMenuItemInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMenuItemInput)
  items?: CreateMenuItemInput[];
}
