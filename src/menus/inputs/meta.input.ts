import { Field, InputType } from '@nestjs/graphql';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MenuMetaType } from 'src/common/types';

@InputType()
export class MenuMetaInput {
  @Field()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @Field()
  @IsEnum(MenuMetaType)
  type: MenuMetaType;

  @Field()
  @IsDefined()
  required: boolean;
}
