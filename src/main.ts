import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './shared/filters/domain-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // class-validator runs here — rejects malformed requests before they
  // reach the controller, keeping controllers clean of input validation.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,      // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,      // auto-cast primitives (e.g. string "2024" → number)
    }),
  );

  // Maps DomainErrors thrown anywhere in the request pipeline to HTTP responses.
  // Registered globally so controllers never need try/catch.
  app.useGlobalFilters(new DomainExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
