import { Field, ObjectType } from '@nestjs/graphql';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { InitialTemplate } from 'src/common/schema/interfaces/initial-template.interface';

@ObjectType({ implements: () => [InitialTemplate] })
export default class MenuItemInitialTemplate extends InitialTemplate {
  @Field(() => String)
  [TemplateFormat.JSON] = `${RenderItemPartial[TemplateFormat.JSON]}
{{#jsonFormatter spaces=2}}
{{> defaultTemplate item=item }}
{{/jsonFormatter}}`;

  @Field(() => String)
  [TemplateFormat.XML] = `${RenderItemPartial[TemplateFormat.XML]}
{{> defaultTemplate item=item }}`;

  @Field(() => String)
  [TemplateFormat.PLAIN] = this[TemplateFormat.JSON];
}

export class RenderItemPartial {
  static [TemplateFormat.JSON] = `{{#*inline "defaultTemplate" }}
{{#wrapItemCondition item}}
{
  "id": {{item.id}},
  "label": "{{item.label}}",
  "meta": {{{json item.meta}}},
  "children": [
    {{> recursiveRender items=item.children }}
  ]
}
{{/wrapItemCondition}}
{{~/inline}}`;

  static [TemplateFormat.XML] = `{{#*inline "defaultTemplate" }}
{{#wrapItemCondition item}}

<item id="{{item.id}}" label="{{item.label}}"
  {{~#unless (or item.meta (length item.children))}}/>{{else}}>
  {{~#each item.meta as |meta|}}

  <meta key="{{@key}}" value="{{meta}}"/>
  {{~/each}}
  {{~#if (length item.children)}}

  <children>
  {{~#withIndent spaces=2}}
  {{> recursiveRender items=item.children }}
  {{~/withIndent}}

  </children>
  {{~/if}}

</item>
{{~/unless}}
{{~/wrapItemCondition}}
{{~/inline~}}`;
}
