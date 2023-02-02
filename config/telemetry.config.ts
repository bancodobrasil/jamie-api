import { get } from 'env-var';

type TelemetryConfigOptions = {
  otlpUrl?: string;
  enabled?: boolean;
};

export const telemetryConfig: TelemetryConfigOptions = {
  otlpUrl: get('JAMIE_API_TELEMETRY_OTLP_URL').asString(),
  enabled: get('JAMIE_API_TELEMETRY_ENABLED').asBool(),
};
