/* eslint-disable prefer-rest-params */
import Handlebars from 'handlebars';
import { MenuItem } from 'src/menu-items/entities/menu-item.entity';

export default class TemplateHelpers {
  public static registerHelpers() {
    Handlebars.registerHelper(TemplateHelpers.mathOperators);
    Handlebars.registerHelper(TemplateHelpers.logicOperators);
    Handlebars.registerHelper('length', TemplateHelpers.getLength);
    Handlebars.registerHelper('json', TemplateHelpers.json);
    Handlebars.registerHelper('jsonFormatter', TemplateHelpers.jsonFormatter);
    Handlebars.registerHelper('withIndent', TemplateHelpers.withIndent);
    Handlebars.registerHelper('recursive', TemplateHelpers.recursive);
    Handlebars.registerHelper(
      'renderItemsJSON',
      TemplateHelpers.renderItemsJSON,
    );
    Handlebars.registerHelper('renderItemsXML', TemplateHelpers.renderItemsXML);
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

  public static getLength = (v) => v?.length;

  public static json(context: any, options: Handlebars.HelperOptions) {
    return JSON.stringify(context, null, options.hash.spaces);
  }

  public static jsonFormatter(options: Handlebars.HelperOptions) {
    return JSON.stringify(
      JSON.parse(options.fn(this)),
      null,
      options.hash.spaces,
    );
  }

  public static withIndent(options: Handlebars.HelperOptions) {
    let indent = options.hash.indent;
    indent =
      indent || options.hash.spaces ? ' '.repeat(options.hash.spaces) : '\t';
    const lines = options.fn(this).split('\n');
    return lines.map((line) => indent + line).join('\n');
  }

  public static recursive(items: MenuItem[]) {
    if (!items || !items.length) return '';
    const renderItem = (item: MenuItem): string => {
      if (!item.enabled) return '';
      return item.template;
    };
    return items.map(renderItem);
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
}
