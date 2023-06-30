import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './featws-api.module-definition';
import { FeatwsApiService } from './featws-api.service';

@Module({
  imports: [],
  providers: [FeatwsApiService],
  exports: [FeatwsApiService],
})
export class FeatwsApiModule extends ConfigurableModuleClass {}
