import { registerEnumType } from '@nestjs/graphql';

export enum InputAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
registerEnumType(InputAction, { name: 'InputAction' });
