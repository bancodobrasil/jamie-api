import { get } from 'env-var';

export type FeatwsApiOptions = {
  url: string;
  apiKey?: string;
  apiKeyHeader?: string;
};

// All .env keys start with FEATWS_ to avoid conflicts with other services
export const featwsApiOptions = (): FeatwsApiOptions => ({
  url: get('FEATWS_API_URL').default('http://localhost:9007').asString(),
  apiKey: get('FEATWS_API_GOAUTH_API_KEY').asString(),
  apiKeyHeader: get('FEATWS_API_GOAUTH_API_KEY_HEADER').asString(),
});
