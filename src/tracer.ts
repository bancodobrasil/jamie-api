'use strict';
import { telemetryConfig } from 'config/telemetry.config';
import {
  BasicTracerProvider,
  // ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import { NodeSDK } from '@opentelemetry/sdk-node';
// import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

import { MySQLInstrumentation } from '@opentelemetry/instrumentation-mysql';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import {
  ExpressInstrumentation,
  ExpressLayerType,
} from '@opentelemetry/instrumentation-express';

import { Logger } from '@nestjs/common';

const exporter = new OTLPTraceExporter({
  url: telemetryConfig.otlpUrl,
});

const skipPaths = [/\/metrics\/?$/];

const provider = new BasicTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'jamie-api',
  }),
});
// export spans to console (useful for debugging)
// provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
// export spans to opentelemetry collector
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();
const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [
    new MySQLInstrumentation({
      enabled: true,
    }),
    new HttpInstrumentation({
      enabled: true,
      ignoreIncomingRequestHook: (request) => {
        // Ignore metrics requests
        return skipPaths.some((path) => path.test(request.url));
      },
    }),
    new ExpressInstrumentation({
      enabled: true,
      ignoreLayersType: [ExpressLayerType.ROUTER],
      ignoreLayers: [
        (name) => {
          // Ignore metrics requests
          return skipPaths.some((path) => path.test(name));
        },
      ],
    }),
  ],
});

if (telemetryConfig.enabled) {
  const logger = new Logger('Tracer');
  sdk
    .start()
    .then(() => {
      logger.debug('Tracing initialized');
    })
    .catch((error) => logger.error('Error initializing tracing', error));

  // gracefully shut down the SDK on process exit
  process.on('SIGTERM', async () => {
    try {
      await sdk.shutdown();
      logger.debug('Tracing terminated ');
    } catch (error) {
      logger.error('Error terminating tracing', error);
    } finally {
      process.exit(0);
    }
  });
}

export default sdk;
