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
  {{> recursiveRender items=menu.items }}
]
{{/jsonFormatter}}`;

  @Field(() => String)
  [TemplateFormat.XML] = `${RenderItemPartial[TemplateFormat.XML]}
<?xml version="1.0" encoding="UTF-8"?>
<menu>
{{~#withIndent spaces=2}}
{{> recursiveRender items=menu.items }}
{{~/withIndent}}

</menu>`;

  @Field(() => String)
  [TemplateFormat.PLAIN] = `${RenderItemPartial[TemplateFormat.JSON]}
items=
{{~#jsonFormatter spaces=2}}
[
  {{> recursiveRender items=menu.items }}
]
{{/jsonFormatter}};`;
}
