/* eslint-disable prefer-rest-params */
import Handlebars from 'handlebars';
import { MenuItem } from 'src/menu-items/entities/menu-item.entity';

export default class TemplateHelpers {
  public static setup() {
    TemplateHelpers.registerHelpers();
    TemplateHelpers.registerPartials();
  }

  public static registerHelpers() {
    Handlebars.registerHelper(TemplateHelpers.mathOperators);
    Handlebars.registerHelper(TemplateHelpers.logicOperators);
    Handlebars.registerHelper('hash', TemplateHelpers.hash);
    Handlebars.registerHelper('length', TemplateHelpers.getLength);
    Handlebars.registerHelper('json', TemplateHelpers.json);
    Handlebars.registerHelper('jsonFormatter', TemplateHelpers.jsonFormatter);
    Handlebars.registerHelper('withIndent', TemplateHelpers.withIndent);
    Handlebars.registerHelper(
      'renderItemsJSON',
      TemplateHelpers.renderItemsJSON,
    );
    Handlebars.registerHelper('renderItemsXML', TemplateHelpers.renderItemsXML);
  }

  public static registerPartials() {
    Handlebars.registerPartial('itemJSON', TemplateHelpers.partials.itemJSON);
    Handlebars.registerPartial('itemXML', TemplateHelpers.partials.itemXML);
  }

  public static mathOperators = {
    add: (v1, v2) => v1 + v2,
    sub: (v1, v2) => v1 - v2,
    mul: (v1, v2) => v1 * v2,
    div: (v1, v2) => v1 / v2,
    mod: (v1, v2) => v1 % v2,
    pow: (v1, v2) => v1 ** v2,
    sqrt: (v) => Math.sqrt(v),
    max: (v1, v2) => Math.max(v1, v2),
    min: (v1, v2) => Math.min(v1, v2),
  };

  public static logicOperators = {
    eq: (v1, v2) => v1 === v2,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and() {
      return Array.prototype.every.call(arguments, Boolean);
    },
    or() {
      return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    },
  };

  public static hash = (options: Handlebars.HelperOptions) => {
    // options.hash comes with keys in reverse order
    return Object.keys(options.hash)
      .reverse()
      .reduce((acc, key) => {
        acc[key] = options.hash[key];
        return acc;
      }, {});
  };

  public static getLength = (v) => v?.length;

  public static json(context: any, options: Handlebars.HelperOptions) {
    let str = options.fn(context);
    // remove trailing commas
    str = str.replace(/,(?=\s*?[\]}])/g, '');
    return JSON.stringify(JSON.parse(str), null, options.hash.spaces);
  }

  public static jsonFormatter(options: Handlebars.HelperOptions) {
    // json block helper
    return TemplateHelpers.json(this, options);
  }

  public static withIndent(options: Handlebars.HelperOptions) {
    let indent = options.hash.indent;
    indent =
      indent || options.hash.spaces ? ' '.repeat(options.hash.spaces) : '\t';
    const lines = options.fn(this).split('\n');
    return lines.map((line) => indent + line).join('\n');
  }

  public static renderItemsJSON(
    items: MenuItem[],
    options: Handlebars.HelperOptions,
  ) {
    if (!items || !items.length) return TemplateHelpers.json([], options);
    const renderItem = (item: MenuItem): Record<string, unknown> => {
      if (!item.enabled) return null;
      return JSON.parse(item.template);
    };
    return JSON.stringify(
      items.map(renderItem).filter((v) => v !== null),
      null,
      options.hash.spaces,
    );
  }

  public static renderItemsXML(items: MenuItem[]) {
    if (!items || !items.length) return '';
    const renderItem = (item: MenuItem): string => {
      if (!item.enabled) return '';
      return item.template;
    };
    let xml = '';
    items.forEach((item) => {
      xml += `${renderItem(item)}\n`;
    });
    return xml.substring(0, xml.length - 1);
  }

  public static partials = {
    itemJSON: `{{#jsonFormatter spaces=2}}
{
  {{#each properties as |prop|}}
  {{#if (and (eq @key "children") (length ../item.children)) }}
  "{{prop}}": [
    {{#each ../item.children as |children|}}
    {{#if children.template}}
    {{{ children.template }}}
    {{else}}
    {{> itemJSON item=children properties=../../properties}}
    {{/if}},
    {{/each}}
  ],
  {{else if (and (eq @key "meta") meta) }}
  "{{prop}}": {{{json ../item.meta}}}{{#unless @last}},{{/unless}}
  {{else if (and (ne @key "children") (ne @key "meta"))}}
  "{{prop}}": "{{lookup ../item @key}}"{{#unless @last}},{{/unless}}
  {{/if}}
  {{/each}}
}
{{/jsonFormatter}}`,
    itemXML: `<{{tag}} {{#each properties as |prop|}}
{{~#if (and (ne @key "children") (ne @key "meta"))}}{{prop}}="{{lookup ../item @key}}" {{/if}}
{{~/each}}{{~#unless (or item.meta (length item.children))}}/>{{else}}>
{{#withIndent spaces=2}}
{{~#each item.meta as |meta|}}
<{{lookup (lookup ../properties "meta") "tag"}} {{lookup (lookup ../properties "meta") "key"}}="{{@key}}" {{lookup (lookup ../properties "meta") "value"}}="{{meta}}" />
{{~/each}}

{{~#each item.children as |child|}}

<{{lookup ../properties "children"}}>
{{~#withIndent spaces=2}}
{{~#if child.template}}

{{{child.template}}}
{{~else}}

{{> itemXML tag=../../tag item=child properties=../../properties}}
{{~/if}}
{{~/withIndent}}

</{{lookup ../properties "children"}}>
{{~/each}}
{{~/withIndent}}

</{{tag}}>
{{~/unless}}
`,
  };
}
