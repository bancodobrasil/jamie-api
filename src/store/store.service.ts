import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { StoreOptions, StoreTarget } from './store.options';
import { MODULE_OPTIONS_TOKEN } from './store.module-definition';

@Injectable()
export class StoreService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: StoreOptions,
  ) {}
  private _minio: Client;
  private getMinio(): Client {
    if (!this._minio) {
      this._minio = new Client(this.options.s3);
    }
    return this._minio;
  }
  put(objectName: string, content: string) {
    switch (this.options.target) {
      case StoreTarget.S3:
        return this.getMinio().putObject(
          this.options.s3.bucket,
          objectName,
          content,
        );
      default:
        throw new Error(`Unsupported store target: ${this.options.target}`);
    }
  }
}
