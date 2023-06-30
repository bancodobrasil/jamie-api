import { ConfigurableModuleBuilder } from '@nestjs/common';
import { FeatwsApiOptions } from './featws-api.options';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<FeatwsApiOptions>().build();
