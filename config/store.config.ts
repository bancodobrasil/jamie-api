import { get } from 'env-var';
import { ClientOptions } from 'minio';

type StoreConfigOptions = {
  target?: string;
  endPoint?: string;
  s3?: S3StoreConfigOptions;
};

type S3StoreConfigOptions = ClientOptions & {
  bucket?: string;
};

export const storeConfig = (): StoreConfigOptions => ({
  target: get('JAMIE_API_STORE_TARGET').default('s3').asString(),
  endPoint: get('JAMIE_API_STORE_S3_ENDPOINT').asString(),
  s3: {
    endPoint: get('JAMIE_API_STORE_S3_ENDPOINT').asString(),
    port: get('JAMIE_API_STORE_S3_PORT').default('443').asIntPositive(),
    useSSL: get('JAMIE_API_STORE_S3_SSL').default('true').asBool(),
    accessKey: get('JAMIE_API_STORE_S3_ACCESS_KEY').asString(),
    secretKey: get('JAMIE_API_STORE_S3_SECRET_KEY').asString(),
    bucket: get('JAMIE_API_STORE_S3_BUCKET').asString(),
  },
});
