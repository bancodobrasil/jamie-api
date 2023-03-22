import { Request } from 'express';

export interface GraphQLResolverContext {
  req: Request;
}
