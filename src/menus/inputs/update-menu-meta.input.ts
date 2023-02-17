import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { InputAction } from 'src/common/schema/enums/input-action.enum';
import GraphQLJSON from 'src/common/schema/scalars/json.scalar';
import { MenuMetaType } from 'src/common/types';

@InputType()
export class UpdateMenuMetaInput {
  @Field(() => InputAction)
  @IsDefined()
  @IsEnum(InputAction)
  action: InputAction;

  @Field(() => Int, { nullable: true })
  @ValidateIf(
    (o) => o.action === InputAction.UPDATE || o.action === InputAction.DELETE,
  )
  @IsDefined()
  id?: number;

  @Field()
  @ValidateIf((o) => o.action === InputAction.CREATE)
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @Field()
  @ValidateIf((o) => o.action === InputAction.CREATE)
  @IsEnum(MenuMetaType)
  type?: MenuMetaType;

  @Field(() => Boolean)
  @ValidateIf((o) => o.action === InputAction.CREATE)
  @IsDefined()
  required?: boolean;

  @Field(() => Int)
  @ValidateIf((o) => o.action === InputAction.CREATE)
  @IsDefined()
  order?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  defaultValue?: any;
}
