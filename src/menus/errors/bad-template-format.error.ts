import { GraphQLError } from 'graphql';

export class BadTemplateFormatError extends GraphQLError {
  constructor(originalError: any) {
    super(`Bad template format: ${originalError.message || originalError}`, {
      extensions: {
        code: 'BAD_TEMPLATE_FORMAT',
        originalError,
      },
    });
    this.name = 'BadTemplateFormatError';
  }
}
