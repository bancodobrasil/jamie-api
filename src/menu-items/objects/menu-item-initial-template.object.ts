import { Field, ObjectType } from '@nestjs/graphql';
import { InitialTemplate } from 'src/common/schema/interfaces/initial-template.interface';

@ObjectType({ implements: () => [InitialTemplate] })
export default class MenuItemInitialTemplate extends InitialTemplate {
  @Field(() => String)
  JSON = `{{#with item}}
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
  XML = `{{#with item}}
<item id="{{id}}" label="{{label}}" order="{{order}}" {{~#unless (and meta (length children))}}/>{{else}}>
  {{~#each meta as |meta|}}

  <meta key="{{@key}}" value="{{meta}}" />
  {{~/each}}

{{{renderItemsXML children isChildren=true}}}
</item>
{{/unless}}
{{/with}}`;

  @Field(() => String)
  PLAIN = `{{#with item}}
id = {{id}};
label = "{{label}}";
meta = {{{json meta spaces=2}}};
children = {{{json children spaces=2}}};
{{/with}}`;
}
