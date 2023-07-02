import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { typeOrmConfig } from 'config/typeorm.config';

config();

const configService = new ConfigService();

export default new DataSource(<DataSourceOptions>typeOrmConfig(configService));
