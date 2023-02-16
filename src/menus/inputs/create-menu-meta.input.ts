import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { InputAction } from 'src/common/schema/enums/input-action.enum';
import GraphQLJSON from 'src/common/schema/scalars/json.scalar';
import { MenuMetaType } from 'src/common/types';

@InputType()
export class CreateMenuMetaInput {
  readonly action = InputAction.CREATE;

  @Field()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @Field()
  @IsEnum(MenuMetaType)
  type: MenuMetaType;

  @Field(() => Boolean)
  @IsDefined()
  required: boolean;

  @Field(() => Int)
  @IsDefined()
  order: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  defaultValue?: any;
}
