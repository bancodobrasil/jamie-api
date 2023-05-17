import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FeatwsApiService } from './featws-api/featws-api.service';

@Module({
  imports: [HttpModule],
  providers: [FeatwsApiService],
  exports: [FeatwsApiService],
})
export class HttpClientsModule {}
