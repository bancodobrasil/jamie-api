import { ConfigurableModuleBuilder } from '@nestjs/common';
import { StoreOptions } from './store.options';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<StoreOptions>().build();
