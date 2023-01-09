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
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './logging.interceptor';
// import { CustomExecptionFilter } from './exception.filter';

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
  providers: [AppService, makeCounterProvider({
    name: 'jamie_api_errors',
    help: 'Amount of errors collected in our application',
    labelNames: ['domain', 'status']
  }), 
  {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  },
  // {
    // provide: APP_FILTER,
    // useClass: CustomExecptionFilter,
  // },
],

controllers: [AppController],
})
export class AppModule {}
