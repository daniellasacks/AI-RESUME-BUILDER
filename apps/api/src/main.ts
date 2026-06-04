import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = [
    /^http:\/\/localhost:\d+$/,
    /^https:\/\/daniellasacks\.github\.io$/,
    ...(process.env.WEB_ORIGIN ? [process.env.WEB_ORIGIN] : []),
  ];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
