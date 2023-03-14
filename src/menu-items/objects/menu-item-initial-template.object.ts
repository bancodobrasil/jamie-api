import { Field, ObjectType } from '@nestjs/graphql';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { InitialTemplate } from 'src/common/schema/interfaces/initial-template.interface';

@ObjectType({ implements: () => [InitialTemplate] })
export default class MenuItemInitialTemplate extends InitialTemplate {
  @Field(() => String)
  [TemplateFormat.JSON] = `{{> itemJSON item=item properties=(hash id="id" label="label" meta="meta" children="children") }}`;

  @Field(() => String)
  [TemplateFormat.XML] = `{{> itemXML item=item tag="item" properties=(hash id="id" label="label" meta=(hash tag="meta" key="key" value="value") children="children")}}`;

  @Field(() => String)
  [TemplateFormat.PLAIN] = `{{#with item}}
id = {{id}};
label = "{{label}}";
meta = {{{json meta spaces=2}}};
children = {{{renderItemsJSON children spaces=2}}};
{{/with}}`;
}
