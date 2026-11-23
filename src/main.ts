import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prefix = process.env.GLOBAL_PREFIX || 'api/v1';
  const origin = process.env.FRONTEND_ORIGIN;

  app.setGlobalPrefix(prefix);
  app.enableCors({
    origin: origin
      ? origin
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = Number(process.env.PORT || 4000);
  await app.listen(port);
  console.log(`BiteHub API ready at http://localhost:${port}/${prefix}`);
}

bootstrap();
