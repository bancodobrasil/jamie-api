import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import axios from 'axios';
import type { Request } from 'express';
import { Counter, Histogram, Summary, Gauge } from 'prom-client';
import { tap } from 'rxjs/operators';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    private readonly logger = new Logger(MetricsInterceptor.name);

    private readonly skipPaths = [/\/metrics.*/];

    constructor(
        @InjectMetric('request_seconds_bucket') private requestBucket: Histogram<string>,
        @InjectMetric('request_seconds_count') private requestCount: Counter<string>,
        @InjectMetric('request_seconds_sum') private requestSum: Summary<string>,
        @InjectMetric('response_size_bytes') private responseSize: Counter<string>,
        @InjectMetric('dependency_up') private dependencyUp: Gauge<string>,
        @InjectMetric('dependency_request_seconds_bucket') private depRequestBucket: Histogram<string>,
        @InjectMetric('dependency_request_seconds_count') private depRequestCount: Counter<string>,
        @InjectMetric('dependency_request_seconds_sum') private depRequestSum: Summary<string>,
        @InjectMetric('application_info') private appInfo: Gauge<string>,
    ) {
        this.appInfo.set({ version: '1.0.0' }, 1);
    }

    intercept(context: ExecutionContext, next: CallHandler) {
        this.logger.debug({ interceptor: 'metrics', type: context.getType() });
        if (context.getType() === 'http') {
            return this.countHttpCall(context, next);
        }
        return next.handle();
    }

    private countHttpCall(context: ExecutionContext, next: CallHandler) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();

        const type = 'http';
        const status = request.statusCode;
        const method = request.method;
        const addr = request.path;

        if (this.skipPaths.find((p) => p.test(addr))) {
            this.logger.verbose(`Skipped path "${addr}"`);
            return next.handle();
        }

        const end = this.requestBucket.startTimer({ type, status, method, addr });

        return next.handle().pipe(
            tap(async () => {
                this.requestCount.inc({ type, status, method, addr });
                this.requestSum.observe({ type, status, method, addr }, end());
                if (request.headers['content-length']) {
                    this.responseSize.inc({ type, status, method, addr }, parseInt(request.headers['content-length'], 10));
                }

                // Check dependency and update dependencyUp metrics
                try {
                    const start = Date.now();
                    const response = await axios.get('https://google.com');
                    const duration = Date.now() - start;
                    this.dependencyUp.set({ dependency: 'google' }, 1);
                    this.depRequestBucket.observe({ dependency: 'google' }, duration);
                    this.depRequestCount.inc({ dependency: 'google' });
                    this.depRequestSum.observe({ dependency: 'google' }, duration);
                } catch (error) {
                    this.dependencyUp.set({ dependency: 'google' }, 0);
                }
            }),
        );
    }
}
