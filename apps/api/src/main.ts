import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(cookieParser());
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const globalPrefix = process.env.GLOBAL_PREFIX || 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.BACKEND_PORT || process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
