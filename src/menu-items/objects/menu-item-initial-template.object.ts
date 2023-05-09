import { Field, ObjectType } from '@nestjs/graphql';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { InitialTemplate } from 'src/common/schema/interfaces/initial-template.interface';

@ObjectType({ implements: () => [InitialTemplate] })
export default class MenuItemInitialTemplate extends InitialTemplate {
  @Field(() => String)
  [TemplateFormat.JSON] = `${RenderItemPartial[TemplateFormat.JSON]}
{{> renderItem item=item }}`;

  @Field(() => String)
  [TemplateFormat.XML] = `${RenderItemPartial[TemplateFormat.XML]}
{{> renderItem item=item }}`;

  @Field(() => String)
  [TemplateFormat.PLAIN] = this[TemplateFormat.JSON];
}

export class RenderItemPartial {
  static [TemplateFormat.JSON] = `{{#*inline "renderItem" }}
{{#jsonFormatter spaces=2}}
{
  "id": {{item.id}},
  "label": "{{item.label}}",
  "meta": {{{json item.meta}}},
  "children": [
    {{#each item.children as |child|}}
    {{#if child.template}}
    {{{ child.template }}}
    {{else}}
    {{> renderItem item=child}}
    {{/if}},
    {{/each}}
  ]
}
{{/jsonFormatter}}
{{~/inline}}`;

  static [TemplateFormat.XML] = `{{#*inline "renderItem" }}
<item id="{{item.id}}" label="{{item.label}}"
  {{~#unless (or item.meta (length item.children))}}/>{{else}}>
  {{~#each item.meta as |meta|}}

  <meta key="{{@key}}" value="{{meta}}"/>
  {{~/each}}
  {{~#if (length item.children)}}

  <children>
  {{~#each item.children as |child|}}

  {{~#withIndent spaces=2}}
  {{~#if child.template}}

  {{{child.template}}}
  {{~else}}

  {{> renderItem item=child}}
  {{~/if}}
  {{~/withIndent}}

  {{~/each}}

  </children>
  {{~/if}}

</item>
{{~/unless}}
{{~/inline}}`;
}
