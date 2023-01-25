import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import FieldValidationError from './common/errors/field-validation.error';
import tracer from './tracer';

const { PORT = 5000 } = process.env;

async function bootstrap() {
  await tracer.start();

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        return FieldValidationError.fromValidationErrors(errors);
      },
    }),
  );
  await app.listen(PORT);
}
bootstrap();
