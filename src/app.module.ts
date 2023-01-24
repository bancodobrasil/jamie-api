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
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { typeOrmConfig } from 'config/typeorm.config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
    }),
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],

  controllers: [AppController],
})
export class AppModule {}
