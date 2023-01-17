import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import tracer from './tracer';

const { PORT = 5000 } = process.env;

async function bootstrap() {
  await tracer.start();

  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
}
bootstrap();
