import { Field, ObjectType } from '@nestjs/graphql';
import { TemplateFormat } from 'src/common/enums/template-format.enum';
import { InitialTemplate } from 'src/common/schema/interfaces/initial-template.interface';

@ObjectType({ implements: () => [InitialTemplate] })
export default class MenuInitialTemplate extends InitialTemplate {
  @Field(() => String)
  [TemplateFormat.JSON] = `{{#with menu}}
{{#jsonFormatter spaces=2}}
{
  "name": "{{name}}",
  "meta": {{{json meta}}},
  "items": {{{renderItemsJSON items}}}
}
{{/jsonFormatter}}
{{/with}}`;

  @Field(() => String)
  [TemplateFormat.XML] = `{{#with menu}}
<menu name="{{name}}" {{~#unless (and (length meta) (length items))}}/>{{else}}>
  {{~#each meta as |meta|}}
  {{~#if meta.enabled}}

  <meta id="{{meta.id}}" name="{{meta.name}}" type="{{meta.type}}" required="{{meta.required}}" defaultValue="{{meta.defaultValue}}" />
  {{~/if}}
  {{~/each}}

{{{renderItemsXML items}}}
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
