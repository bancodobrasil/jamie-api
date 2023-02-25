import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

type TypeOrmConfig = (...args: any[]) => TypeOrmModuleOptions;

export const typeOrmConfig: TypeOrmConfig = (configService: ConfigService) => {
  return {
    type: 'mysql',
    host: configService.get('JAMIE_API_DATABASE_HOST'),
    port: +configService.get('JAMIE_API_DATABASE_PORT'),
    username: configService.get('JAMIE_API_DATABASE_USER'),
    password: configService.get('JAMIE_API_DATABASE_PASSWORD'),
    database: configService.get('JAMIE_API_DATABASE_NAME'),
    timezone: 'Z',
    entities: [join(__dirname, '..', 'src', '**', '*.entity{.js,.ts}')],
    subscribers: [join(__dirname, '..', 'src', '**', '*.subscriber{.js,.ts}')],
    migrationsRun: true,
    migrations: [join(__dirname, '..', 'migrations', '*{.js,.ts}')],
    namingStrategy: new SnakeNamingStrategy(),
    logging: true,
  };
};
