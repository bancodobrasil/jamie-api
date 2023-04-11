import { Field, ObjectType } from '@nestjs/graphql';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { InitialTemplate } from 'src/common/schema/interfaces/initial-template.interface';
import { RenderItemPartial } from 'src/menu-items/objects/menu-item-initial-template.object';

@ObjectType({ implements: () => [InitialTemplate] })
export default class MenuInitialTemplate extends InitialTemplate {
  @Field(() => String)
  [TemplateFormat.JSON] = `${RenderItemPartial[TemplateFormat.JSON]}
{{#jsonFormatter spaces=2}}
[
  {{#each menu.items as |item|}}
  {{#if item.template}}
  {{{ item.template }}},
  {{else}}
  {{> itemJSON item=item}},
  {{/if}}
  {{/each}}
]
{{/jsonFormatter}}`;

  @Field(() => String)
  [TemplateFormat.XML] = `${RenderItemPartial[TemplateFormat.XML]}
<items>
{{~#withIndent spaces=2}}
{{~#each menu.items as |item|}}
{{~#if item.template}}

{{{ item.template }}}
{{~else}}

{{> itemXML item=child}}
{{~/if}}
{{~/each}}

{{~/withIndent}}

</items>`;

  @Field(() => String)
  [TemplateFormat.PLAIN] = `${RenderItemPartial[TemplateFormat.JSON]}
items=
{{~#jsonFormatter spaces=2}}
[
  {{#each menu.items as |item|}}
  {{#if item.template}}
  {{{ item.template }}},
  {{else}}
  {{> itemJSON item=item properties=(hash id="id" label="label" meta="meta" children="children") }},
  {{/if}}
  {{/each}}
]
{{/jsonFormatter}};`;
}
