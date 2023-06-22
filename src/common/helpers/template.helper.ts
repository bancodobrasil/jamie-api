/* eslint-disable prefer-rest-params */
import Handlebars from 'handlebars';
import { RenderMenuItemTemplateInput } from 'src/menus/inputs/render-menu-item-template.input';
import { RenderMenuTemplateInput } from 'src/menus/inputs/render-menu-template.input';
import { TemplateFormat } from '../enums/template-format.enum';
import { BadTemplateFormatError } from 'src/menus/errors/bad-template-format.error';
import { MenuMeta } from 'src/menus/objects/menu-meta.object';

export default class TemplateHelpers {
  private static renderConditions = false;

  public static renderMenuItemTemplate(
    item: RenderMenuItemTemplateInput,
    menu: RenderMenuTemplateInput,
    renderConditions = false,
  ): string {
    const children = item.children
      ?.map((item: RenderMenuItemTemplateInput) => {
        const template = this.renderMenuItemTemplate(
          item,
          menu,
          renderConditions,
        );
        return {
          ...item,
          template,
        };
      })
      .sort((a, b) => a.order - b.order);
    const meta: Record<string, unknown> = {};
    menu.meta?.forEach((m: MenuMeta) => {
      if (item.enabled) {
        meta[m.name] = item.meta[item.id] || m.defaultValue;
      }
    });
    if (!item.template) return '';
    try {
      TemplateHelpers.setup(renderConditions);
      const result = Handlebars.compile(item.template)({
        item: {
          ...item,
          meta,
          children,
        },
      });
      if (!renderConditions && item.templateFormat === TemplateFormat.JSON) {
        JSON.parse(result);
      }
      return result;
    } catch (err) {
      console.error(err);
      throw new BadTemplateFormatError(err);
    }
  }

  public static renderMenuTemplate(
    menu: RenderMenuTemplateInput,
    renderConditions = false,
  ) {
    let items = menu.items?.map((item: RenderMenuItemTemplateInput) => {
      const template = this.renderMenuItemTemplate(
        item,
        menu,
        renderConditions,
      );
      return {
        ...item,
        template,
      };
    });
    items =
      items
        .filter((item) => !item.parentId)
        .sort((a, b) => a.order - b.order) || [];
    try {
      TemplateHelpers.setup(renderConditions);
      const result = Handlebars.compile(menu.template)({
        menu: {
          ...menu,
          items,
        },
      });
      if (!renderConditions && menu.templateFormat === TemplateFormat.JSON) {
        JSON.parse(result);
      }
      return result;
    } catch (err) {
      console.error(err);
      throw new BadTemplateFormatError(err);
    }
  }

  private static setup(renderConditions = false) {
    TemplateHelpers.renderConditions = renderConditions;
    TemplateHelpers.registerHelpers();
    TemplateHelpers.registerPartials();
  }

  private static registerHelpers() {
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

  private static registerPartials() {
    Handlebars.registerPartial(
      'recursiveRender',
      TemplateHelpers.partials.recursiveRender,
    );
  }

  private static mathOperators = {
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

  private static logicOperators = {
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

  private static defaultsTo = (value, defaultValue) => {
    console.log(value, defaultValue);
    console.log(Handlebars.Utils.isEmpty(value));
    return Handlebars.Utils.isEmpty(value) ? defaultValue : value;
  };

  private static wrapItemCondition(
    item: any,
    options: Handlebars.HelperOptions,
  ) {
    if (TemplateHelpers.renderConditions && item?.id) {
      return `{{if menu_item_${item.id}}}${options.fn(this)}{{end}}`;
    }
    return options.fn(this);
  }

  private static hash = (options: Handlebars.HelperOptions) => {
    // options.hash comes with keys in reverse order
    return Object.keys(options.hash)
      .reverse()
      .reduce((acc, key) => {
        acc[key] = options.hash[key];
        return acc;
      }, {});
  };

  private static getLength = (v) => v?.length;

  private static json(context: any, options: Handlebars.HelperOptions) {
    let str = options.fn ? options.fn(context) : JSON.stringify(context);
    if (!str) return JSON.stringify(null);
    // remove trailing commas
    str = str.replace(/,(?=\s*?[\]}])/g, '');
    return JSON.stringify(JSON.parse(str), null, options.hash.spaces);
  }

  private static jsonFormatter(options: Handlebars.HelperOptions) {
    // json block helper
    return TemplateHelpers.json(this, options);
  }

  private static withIndent(options: Handlebars.HelperOptions) {
    let indent = options.hash.indent;
    indent =
      indent || options.hash.spaces ? ' '.repeat(options.hash.spaces) : '\t';
    const lines = options.fn(this).split('\n');
    return lines.map((line) => indent + line).join('\n');
  }

  private static partials = {
    recursiveRender: `{{#each items as |item|}}
{{#if item.template}}
{{{ item.template }}},
{{else}}
{{> (defaultsTo ../partial 'defaultTemplate') item=item}}
{{/if}}
{{/each}}`,
  };
}
