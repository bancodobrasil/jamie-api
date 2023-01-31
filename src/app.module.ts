import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
  makeSummaryProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { typeOrmConfig } from 'config/typeorm.config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BigBrotherMetricsInterceptor } from './bbmetrics.interceptor';
import { LoggingInterceptor } from './logging.interceptor';
import { MenusModule } from './menus/menus.module';
import { MetricsInterceptor } from './metrics.interceptor';

@Module({
  imports: [
    PrometheusModule.register(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    MenusModule,
  ],
  providers: [
    AppService,
    makeCounterProvider({
      name: 'http_requests_traffic',
      help: 'Count how many http requests are made to the server',
      labelNames: ['endpoint', 'method'],
    }),
    makeCounterProvider({
      name: 'http_requests_errors_count',
      help: 'Total number of request errors',
      labelNames: ['endpoint', 'method'],
    }),
    makeHistogramProvider({
      name: 'http_requests_latency',
      help: 'Count http requests latency time',
      labelNames: ['endpoint', 'method'],
    }),
    makeGaugeProvider({
      name: 'http_requests_saturation',
      help: 'Current number of requests being handled',
      labelNames: ['endpoint', 'method'],
    }),
    makeHistogramProvider({
      name: 'request_seconds_bucket',
      help: 'Count http requests latency time big brother on a bucket',
      labelNames: ['type', 'status', 'isError', 'errorMessage', 'method', 'addr'],
    }),
    makeCounterProvider({
      name: 'request_seconds_count',
      help: 'Count http requests latency time big brother on a count',
      labelNames: ['type', 'status','isError', 'errorMessage', 'method', 'addr'],
    }),
    makeSummaryProvider({
      name: 'request_seconds_sum',
      help: 'Count http requests latency time big brother on a summary',
      labelNames: ['type', 'status','isError', 'errorMessage', 'method', 'addr'],
    }),
    makeCounterProvider({
      name: 'response_size_bytes',
      help: 'Count http response size',
      labelNames: ['type', 'status','isError', 'errorMessage', 'method', 'addr'],
    }),
    makeGaugeProvider({
      name: 'dependency_up',
      help: 'Check if dependency is up',
      labelNames: ['name'],
    }),
    makeHistogramProvider({
      name: 'dependency_request_seconds_bucket',
      help: 'Count dependency requests latency time big brother on a bucket',
      labelNames: ['name','type', 'status','isError', 'errorMessage', 'method', 'addr'],
    }),
    makeCounterProvider({
      name: 'dependency_request_seconds_count',
      help: 'Count dependency requests latency time big brother on a count',
      labelNames: ['name', 'type', 'status','isError', 'errorMessage', 'method', 'addr'],
    }),
    makeSummaryProvider({
      name: 'dependency_request_seconds_sum',
      help: 'Count dependency requests latency time big brother on a summary',
      labelNames: ['name', 'type', 'status','isError', 'errorMessage', 'method', 'addr'],
    }),
    makeGaugeProvider({
      name: 'application_info',
      help: 'Application info',
      labelNames: ['version'],
    }),

    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: BigBrotherMetricsInterceptor,
    }
  ],

  controllers: [AppController],
})
export class AppModule {}
