import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './store.module-definition';
import { StoreService } from './store.service';

@Module({
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule extends ConfigurableModuleClass {}
