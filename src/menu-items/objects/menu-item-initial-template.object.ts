import { Field, ObjectType } from '@nestjs/graphql';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { InitialTemplate } from 'src/common/schema/interfaces/initial-template.interface';

@ObjectType({ implements: () => [InitialTemplate] })
export default class MenuItemInitialTemplate extends InitialTemplate {
  @Field(() => String)
  [TemplateFormat.JSON] = `{{#with item}}
{{#jsonFormatter spaces=2}}
{
  "id": {{id}},
  "label": "{{label}}",
  "order": {{order}},
  "meta": {{{json meta}}},
  "children": {{{renderItemsJSON children}}}
}
{{/jsonFormatter}}
{{/with}}`;

  @Field(() => String)
  [TemplateFormat.XML] = `{{#with item}}
<item id="{{id}}" label="{{label}}" order="{{order}}" {{~#unless (and meta (length children))}}/>{{else}}>
  {{~#each meta as |meta|}}

  <meta key="{{@key}}" value="{{meta}}" />
  {{~/each}}

{{~#each children as |child|}}

  <children>
{{~#withIndent spaces=(max (mul @index 2) 4)}}
  
{{{child.template}}}
{{~/withIndent}}

  </children>
{{~/each}}
  
</item>
{{~/unless}}
{{~/with}}`;

  @Field(() => String)
  [TemplateFormat.PLAIN] = `{{#with item}}
id = {{id}};
label = "{{label}}";
meta = {{{json meta spaces=2}}};
children = {{{renderItemsJSON children spaces=2}}};
{{/with}}`;
}
