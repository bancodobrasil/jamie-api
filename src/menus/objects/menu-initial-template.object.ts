import { Field, ObjectType } from '@nestjs/graphql';
import { InitialTemplate } from 'src/common/schema/objects/initial-template.object';

@ObjectType()
export default class MenuInitialTemplate extends InitialTemplate {
  @Field(() => String)
  JSON = `{{#with menu}}
{{#jsonFormatter spaces=2}}
{
  "name": "{{name}}",
  "meta": {{{json meta}}},
  "items": {{{renderItemsJSON items}}}
}
{{/jsonFormatter}}
{{/with}}`;

  @Field(() => String)
  XML = `{{#with menu}}
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
  PLAIN = `{{#with menu}}
name = "{{name}}";
meta = {{{json meta spaces=2}}};
items = {{{json items spaces=2}}};
{{/with}}`;
}
