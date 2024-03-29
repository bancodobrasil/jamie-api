import { MenuItem } from 'src/menu-items/entities/menu-item.entity';
import { MenuMeta } from 'src/menus/objects/menu-meta.object';
import { InputAction } from '../schema/enums/input-action.enum';
import { PageInfo } from '../schema/objects/page-info.object';

export enum MenuMetaType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  // TIME = 'time',
  // DATETIME = 'datetime',
  // SELECT = 'select',
  // RADIO = 'radio',
  // CHECKBOX = 'checkbox',
  // TEXTAREA = 'textarea',
  // IMAGE = 'image',
  // FILE = 'file',
  // COLOR = 'color',
  // RICHTEXT = 'richtext',
  // MARKDOWN = 'markdown',
  // HTML = 'html',
  // JSON = 'json',
  // ARRAY = 'array',
  // OBJECT = 'object',
}

export interface IMenuItemMeta {
  [index: number]: unknown;
}

export type MenuItemSnapshot = Omit<
  MenuItem,
  'defaultTemplate' | 'version' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;
export interface MenuRevisionSnapshot {
  name: string;
  meta?: MenuMeta[];
  items?: MenuItemSnapshot[];
  template?: string;
  templateFormat?: string;
  parameters?: string;
  featwsVersion?: string;
}

export type WithAction<T> = T & { action?: InputAction };

export interface Edge<T> {
  cursor: string;
  node: T;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}
