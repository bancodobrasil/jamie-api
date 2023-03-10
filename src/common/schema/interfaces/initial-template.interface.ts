import { Field, InterfaceType } from '@nestjs/graphql';
import { TemplateFormat } from 'src/common/enums/template-format.enum';

@InterfaceType()
export abstract class InitialTemplate {
  @Field(() => String)
  [TemplateFormat.JSON]: string;

  @Field(() => String)
  [TemplateFormat.XML]: string;

  @Field(() => String)
  [TemplateFormat.PLAIN]: string;
}
