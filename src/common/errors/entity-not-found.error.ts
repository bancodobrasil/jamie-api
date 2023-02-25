import { GraphQLError } from 'graphql';

export class EntityNotFoundError<
  T extends string | { name: string },
> extends GraphQLError {
  constructor(entity: T, id: number) {
    const e =
      typeof entity === 'string'
        ? entity
        : entity.constructor?.name !== 'Function'
        ? entity.constructor.name
        : entity.name;
    super(`${e} with id ${id} not found`, {
      extensions: {
        code: 'ENTITY_NOT_FOUND',
        entity: e,
        id,
      },
    });
    this.name = 'EntityNotFoundError';
  }
}
