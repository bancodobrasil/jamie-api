import type { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Request } from 'express';
import { Counter, Histogram, Gauge } from 'prom-client';
import { tap } from 'rxjs/operators';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_count') private requestCounter: Counter,
    @InjectMetric('http_requests_latency') private requestLatency: Histogram,
    @InjectMetric('http_errors_count') private errorCounter: Counter,
    @InjectMetric('http_concurrent_requests') private concurrentRequests: Gauge,
    @InjectMetric('http_errors_rate') private errorRate: Gauge,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    const endpoint = request.path;
    const method = request.method;

    const start = Date.now();

    this.concurrentRequests.inc();
    this.requestCounter.inc();

    return next.handle().pipe(
      tap(() => {
        this.concurrentRequests.dec();
        this.requestLatency.observe(Date.now() - start);
        if (request.statusCode >= 400) {
          this.errorCounter.inc();
        }
        // this.errorRate.set(this.errorCounter.get() / this.requestCounter.get());
      }),
    );
  }
}