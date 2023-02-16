import { Field, InputType, Int, OmitType, PartialType } from '@nestjs/graphql';
import { IsDefined, IsEnum, ValidateIf } from 'class-validator';
import { InputAction } from 'src/common/schema/enums/input-action.enum';
import { CreateMenuMetaInput } from './create-menu-meta.input';

@InputType()
export class UpdateMenuMetaInput extends PartialType(
  OmitType(CreateMenuMetaInput, ['action']),
) {
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
}
