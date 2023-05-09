/* eslint-disable prefer-rest-params */
import Handlebars from 'handlebars';

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
    let str = options.fn ? options.fn(context) : JSON.stringify(context);
    if (!str) return JSON.stringify(null);
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
  {{else if (and (eq @key "meta") ../item.meta) }}
  "{{prop.key}}": {
    {{~#each ../item.meta as |meta|}}
    "{{#if (and prop.mapKeys (lookup prop.mapKeys @key))}}{{lookup prop.mapKeys @key}}{{else}}{{@key}}{{/if}}": {{{json meta}}}{{#unless @last}},{{/unless}}
    {{~/each}}
  }{{#unless @last}},{{/unless}}
  {{else if (and (ne @key "children") (ne @key "meta"))}}
  "{{prop}}": "{{lookup ../item @key}}"{{#unless @last}},{{/unless}}
  {{/if}}
  {{/each}}
}
{{/jsonFormatter}}`,
    itemXML: `<{{tag}} {{#each properties as |prop|}}
{{~#if (and (ne @key "children") (ne @key "meta"))}}{{prop}}="{{lookup ../item @key}}" {{/if}}
{{~/each}}{{~#unless (or (and properties.meta item.meta) (length item.children))}}/>{{else}}>

{{~#withIndent spaces=2}}

{{~#if properties.meta }}
{{~#each item.meta as |meta|}}

<{{lookup (lookup ../properties "meta") "tag"}} {{lookup (lookup ../properties "meta") "key"}}="{{#if (and ../properties.meta.mapKeys (lookup ../properties.meta.mapKeys @key))}}{{lookup ../properties.meta.mapKeys @key}}{{else}}{{@key}}{{/if}}" {{lookup (lookup ../properties "meta") "value"}}="{{meta}}" />

{{~/each}}
{{~/if}}

{{~#each item.children as |child|}}

<{{lookup ../properties "children"}}>
{{~#withIndent spaces=2}}
{{~#if child.template}}

{{{child.template}}}
{{~else}}

{{> itemXML tag=../tag item=child properties=../properties}}
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
