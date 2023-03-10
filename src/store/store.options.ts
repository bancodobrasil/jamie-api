import { ClientOptions } from 'minio';

export enum StoreTarget {
  S3 = 's3',
}

export type StoreOptions = {
  target: StoreTarget;
  s3?: S3StoreOptions;
};

export type S3StoreOptions = ClientOptions & {
  bucket?: string;
};
