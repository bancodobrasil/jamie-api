import { HttpStatus } from '@nestjs/common';

export enum ErrorDomain {
    Generic = 'generic',
    MenuItem = 'menu-item',
    Order = 'order',
    Users = 'users',
}

export class BusinessException extends Error {
  public readonly id: string;
  public readonly timestamp: Date;

  constructor(
    public readonly domain: ErrorDomain,
    public readonly message: string,
    public readonly apiMessage: string,
    public readonly status: HttpStatus,
  ) {
    super(message);
    this.id = BusinessException.genId();
    this.timestamp = new Date();
  }

   private static genId(length = 16): string {
    const p = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return[...Array(length)].reduce(
        (a) => a + p[~~(Math.random() * p.length)],
        '',
    );
   }
}