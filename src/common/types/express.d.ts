// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        sub: string;
      };
    }
  }
}
