import { HttpClientError } from '../http-client.errors';

export class FeatwsApiError extends HttpClientError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, {
      code: 'FEATWS_API_ERROR',
      ...extensions,
    });
    this.name = 'FeatwsApiError';
  }
}
