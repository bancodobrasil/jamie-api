import { Field, ObjectType } from '@nestjs/graphql';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { InitialTemplate } from 'src/common/schema/interfaces/initial-template.interface';

@ObjectType({ implements: () => [InitialTemplate] })
export default class MenuInitialTemplate extends InitialTemplate {
  @Field(() => String)
  [TemplateFormat.JSON] = `{{#jsonFormatter spaces=2}}
[
  {{#each items}}
  {{> itemJSON item=this properties=(hash id="id" label="label" meta="meta" items="items") }}{{#unless @last}},{{/unless}}
  {{/each}}
]
{{/jsonFormatter}}`;

  @Field(() => String)
  [TemplateFormat.XML] = `{{#with menu}}
<menu name="{{name}}" {{~#unless (or (length meta) (length items))}}/>{{else}}>
  {{~#each meta as |meta|}}
  {{~#if meta.enabled}}

  <meta id="{{meta.id}}" name="{{meta.name}}" type="{{meta.type}}" required="{{meta.required}}" defaultValue="{{meta.defaultValue}}" />
  {{~/if}}
  {{~/each}}
  
  <items>
{{~#withIndent spaces=4}}

{{{renderItemsXML items}}}
{{~/withIndent}}

  </items>
</menu>
{{/unless}}
{{/with}}`;

  @Field(() => String)
  [TemplateFormat.PLAIN] = `{{#with menu}}
name = "{{name}}";
meta = {{{json meta spaces=2}}};
items = {{{renderItemsJSON items spaces=2}}};
{{/with}}`;
}
