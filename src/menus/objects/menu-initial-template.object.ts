import { Field, ObjectType } from '@nestjs/graphql';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { InitialTemplate } from 'src/common/schema/interfaces/initial-template.interface';
import MenuItemInitialTemplate from 'src/menu-items/objects/menu-item-initial-template.object';

@ObjectType({ implements: () => [InitialTemplate] })
export default class MenuInitialTemplate extends InitialTemplate {
  @Field(() => String)
  [TemplateFormat.JSON] = `{{#jsonFormatter spaces=2}}
[
  {{#each menu.items as |item|}}
  {{#if item.template}}
  {{{ item.template }}},
  {{else}}
  ${new MenuItemInitialTemplate()[TemplateFormat.JSON]},
  {{/if}}
  {{/each}}
]
{{/jsonFormatter}}`;

  @Field(() => String)
  [TemplateFormat.XML] = `<items>
{{~#withIndent spaces=2}}
{{~#each menu.items as |item|}}
{{~#if item.template}}

{{{ item.template }}}
{{~else}}

${new MenuItemInitialTemplate()[TemplateFormat.XML]}
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
