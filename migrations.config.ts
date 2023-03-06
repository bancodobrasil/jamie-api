import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get('JAMIE_API_DATABASE_HOST'),
  port: +configService.get('JAMIE_API_DATABASE_PORT'),
  username: configService.get('JAMIE_API_DATABASE_USER'),
  password: configService.get('JAMIE_API_DATABASE_PASSWORD'),
  database: configService.get('JAMIE_API_DATABASE_NAME'),
  timezone: 'Z',
  entities: [join(__dirname, 'dist', 'src', '**', '*.entity.js')],
  migrations: [join(__dirname, 'dist', 'migrations', '*.js')],
  namingStrategy: new SnakeNamingStrategy(),
  logging: true,
});
