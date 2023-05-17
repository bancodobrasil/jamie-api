import { GraphQLError } from 'graphql';

export class HttpClientError extends GraphQLError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, {
      extensions: {
        code: 'HTTP_CLIENT_ERROR',
        status: 500,
        ...extensions,
      },
    });
    this.name = 'HttpClientError';
  }
}
