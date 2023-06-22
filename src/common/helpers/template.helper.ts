/* eslint-disable prefer-rest-params */
import Handlebars from 'handlebars';

export default class TemplateHelpers {
  private static renderConditions = false;

  public static setup(renderConditions = false) {
    TemplateHelpers.registerHelpers();
    TemplateHelpers.registerPartials();
    TemplateHelpers.renderConditions = renderConditions;
  }

  public static registerHelpers() {
    Handlebars.registerHelper(TemplateHelpers.mathOperators);
    Handlebars.registerHelper(TemplateHelpers.logicOperators);
    Handlebars.registerHelper('defaultsTo', TemplateHelpers.defaultsTo);
    Handlebars.registerHelper(
      'wrapItemCondition',
      TemplateHelpers.wrapItemCondition,
    );
    Handlebars.registerHelper('hash', TemplateHelpers.hash);
    Handlebars.registerHelper('length', TemplateHelpers.getLength);
    Handlebars.registerHelper('json', TemplateHelpers.json);
    Handlebars.registerHelper('jsonFormatter', TemplateHelpers.jsonFormatter);
    Handlebars.registerHelper('withIndent', TemplateHelpers.withIndent);
  }

  public static registerPartials() {
    Handlebars.registerPartial(
      'recursiveRender',
      TemplateHelpers.partials.recursiveRender,
    );
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

  public static defaultsTo = (value, defaultValue) => {
    console.log(value, defaultValue);
    console.log(Handlebars.Utils.isEmpty(value));
    return Handlebars.Utils.isEmpty(value) ? defaultValue : value;
  };

  public static wrapItemCondition(
    item: any,
    options: Handlebars.HelperOptions,
  ) {
    if (TemplateHelpers.renderConditions && item?.id) {
      return `{{if menu_item_${item.id}}}${options.fn(this)}{{end}}`;
    }
    return options.fn(this);
  }

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
    recursiveRender: `{{#each items as |item|}}
{{#if item.template}}
{{{ item.template }}},
{{else}}
{{> (defaultsTo ../partial 'defaultTemplate') item=item}}
{{/if}}
{{/each}}`,
  };
}
