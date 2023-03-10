import { get } from 'env-var';
import { StoreOptions, StoreTarget } from 'src/store/store.options';

export const storeConfig = (): StoreOptions => ({
  target: get('JAMIE_API_STORE_TARGET').default('s3').asString() as StoreTarget,
  s3: {
    endPoint: get('JAMIE_API_STORE_S3_ENDPOINT').asString(),
    port: get('JAMIE_API_STORE_S3_PORT').default('443').asIntPositive(),
    useSSL: get('JAMIE_API_STORE_S3_SSL').default('true').asBool(),
    accessKey: get('JAMIE_API_STORE_S3_ACCESS_KEY').asString(),
    secretKey: get('JAMIE_API_STORE_S3_SECRET_KEY').asString(),
    bucket: get('JAMIE_API_STORE_S3_BUCKET').asString(),
  },
});
