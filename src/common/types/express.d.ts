// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express';
import { KeycloakAccessToken } from './keycloak.type';

declare global {
  namespace Express {
    export interface Request {
      user?: KeycloakAccessToken;
    }
  }
}
