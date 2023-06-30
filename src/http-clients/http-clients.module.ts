import { HttpModule, HttpService } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { featwsApiOptions } from './featws-api/featws-api.options';
import { FeatwsApiModule } from './featws-api/featws-api.module';

@Module({
  imports: [
    HttpModule,
    FeatwsApiModule.registerAsync({
      useFactory: featwsApiOptions,
      imports: [HttpModule],
      inject: [HttpService],
    }),
  ],
  exports: [FeatwsApiModule],
})
export class HttpClientsModule {}
