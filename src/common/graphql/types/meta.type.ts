import { ValueNode } from 'graphql';
import { GraphQLScalarType, Kind, print } from 'graphql';
import { IMenuMeta, MenuMetaType } from 'src/common/types';

const ensureMeta = (value: unknown) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`Meta cannot represent non-object value: ${value}`);
  }

  return value;
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

export const GraphQLMeta = new GraphQLScalarType({
  name: 'Meta',
  description:
    "The `Meta` scalar type represents a JSON object containing meta data for the menu's items.",
  serialize: ensureMeta,
  parseValue: ensureMeta,
  parseLiteral,
});

export default GraphQLMeta;
