import { Field, ObjectType } from '@nestjs/graphql';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { InitialTemplate } from 'src/common/schema/interfaces/initial-template.interface';

@ObjectType({ implements: () => [InitialTemplate] })
export default class MenuInitialTemplate extends InitialTemplate {
  @Field(() => String)
  [TemplateFormat.JSON] = `{{#jsonFormatter spaces=2}}
[
  {{#each menu.items as |item|}}
  {{#if item.template}}
  {{{ item.template }}},
  {{else}}
  {{> itemJSON item=item properties=(hash id="id" label="label" meta="meta" children="children") }},
  {{/if}}
  {{/each}}
]
{{/jsonFormatter}}`;

  @Field(() => String)
  [TemplateFormat.XML] = `<items>
{{~#withIndent spaces=2}}
{{~#each menu.items as |item|}}
{{~#if item.template}}

{{{ item.template }}},
{{~else}}

{{> itemXML item=item tag="item" properties=(hash id="id" label="label" meta=(hash tag="meta" key="key" value="value") children="children")}}
{{~/if}}
{{~/each}}

{{~/withIndent}}

</items>`;

  @Field(() => String)
  [TemplateFormat.PLAIN] = `{{#with menu}}
name = "{{name}}";
meta = {{{json meta spaces=2}}};
items = {{{renderItemsJSON items spaces=2}}};
{{/with}}`;
}
