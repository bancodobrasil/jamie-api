import { GraphQLScalarType, Kind, print, ValueNode } from 'graphql';
import { IMenuMeta, MenuMetaType } from 'src/common/types';

const ensureMeta = (value: unknown): IMenuMeta => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`Meta cannot represent non-object value: ${value}`);
  }
  // Validate name
  if (value['name'] === undefined) {
    throw new TypeError(`Meta must have a name: ${JSON.stringify(value)}`);
  }
  // Validate type
  if (value['type'] === undefined) {
    throw new TypeError(`Meta must have a type: ${JSON.stringify(value)}`);
  } else if (!Object.values(MenuMetaType).includes(value['type'])) {
    throw new TypeError(`Invalid Meta type: ${value['type']}`);
  }
  // Validate required
  if (value['required'] === undefined) {
    throw new TypeError(`Meta must have a required: ${JSON.stringify(value)}`);
  }

  return value as IMenuMeta;
};

const parseLiteral = (ast: ValueNode): IMenuMeta => {
  if (ast.kind !== Kind.OBJECT) {
    throw new TypeError(
      `Meta cannot represent non-object value: ${print(ast)}`,
    );
  }
  const value = { name: '', required: false, type: MenuMetaType.TEXT };
  ast.fields.forEach((field) => {
    value[field.name.value] = field.value;
  });
  return value;
};

export const MetaScalar = new GraphQLScalarType({
  name: 'Meta',
  description:
    "The `Meta` scalar type represents a JSON object containing meta data for the menu's items.",
  serialize: ensureMeta,
  parseValue: ensureMeta,
  parseLiteral,
});

export default MetaScalar;
