import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import tracer from './tracer';

async function bootstrap() {
  await tracer.start();

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
