import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { TraceInterceptor } from './common/interceptors/trace.interceptor.js';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  const webOrigin = configService.get<string>('WEB_ORIGIN');
  app.enableCors({
    origin: webOrigin ? webOrigin.split(',') : false,
    credentials: true,
  });

  app.use(json({ limit: '100kb' }));
  app.use(urlencoded({ extended: true, limit: '100kb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TraceInterceptor());

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
}
await bootstrap();
