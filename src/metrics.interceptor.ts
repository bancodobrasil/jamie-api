import type {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Request } from 'express';
import { Counter, Gauge, Histogram } from 'prom-client';
import { tap } from 'rxjs/operators';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MetricsInterceptor.name);

  private readonly skipPaths = [/\/metrics.*/];

  constructor(
    @InjectMetric('http_requests_traffic') private traffic: Counter<string>,
    @InjectMetric('http_requests_errors_count')
    private errors: Counter<string>,
    @InjectMetric('http_requests_latency') private latency: Histogram<string>,
    @InjectMetric('http_requests_saturation') private saturation: Gauge<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    this.logger.debug({ interceptor: 'metrics', type: context.getType() });
    if (context.getType() === 'http') {
      return this.countHttpCall(context, next);
    }
    // TODO countGraphQLCall - qraphql
    return next.handle();
  }

  private countHttpCall(context: ExecutionContext, next: CallHandler) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    const endpoint = request.path;
    const method = request.method;

    if (this.skipPaths.find((p) => p.test(endpoint))) {
      this.logger.verbose(`Skipped path "${endpoint}"`);
      return next.handle();
    }

    this.saturation.inc({ endpoint, method });

    const end = this.latency.startTimer({ endpoint, method });

    return next.handle().pipe(
      tap(() => {
        if (request.statusCode >= 400) {
          this.errors.inc({ endpoint, method });
        }
        this.traffic.inc({ endpoint, method });
        this.saturation.dec({ endpoint, method });
        end();
      }),
    );
  }
}
