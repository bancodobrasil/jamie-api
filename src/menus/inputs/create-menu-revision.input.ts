import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateMenuRevisionInput {
  @Field(() => Int)
  @IsDefined()
  menuId: number;

  @Field()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  description: string;

  @Field(() => Boolean)
  @IsDefined()
  @IsBoolean()
  setAsCurrent: boolean;
}
