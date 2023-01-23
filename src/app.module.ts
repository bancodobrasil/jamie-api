import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { MenusModule } from './menus/menus.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'config/typeorm.config';
import {
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './logging.interceptor';
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
      name: 'http_requests_count',
      help: 'Count http requests',
    }),
<<<<<<< Updated upstream
    makeCounterProvider({
      name: 'http_requests_failures_count',
      help: 'Count http requests fails',
    }),
    makeHistogramProvider({
      name: 'http_requests_bucket',
      help: 'Count http requests time',
=======

    makeHistogramProvider({
      name: 'http_requests_latency',
      help: 'Count http requests latency',
      labelNames: ['endpoint', 'method'],
>>>>>>> Stashed changes
    }),

    makeCounterProvider({
      name: 'http_errors_count',
      help: 'Count http errors',
      labelNames: ['endpoint', 'method'],
    }),

    makeGaugeProvider({
      name: 'http_concurrent_requests',
      help: 'Count http concurrent requests',
      labelNames: ['endpoint', 'method'],
    }),

    makeGaugeProvider({
      name: 'http_errors_rate',
      help: 'Count http errors rate',
      labelNames: ['endpoint', 'method'],
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
