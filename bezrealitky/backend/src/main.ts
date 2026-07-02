import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import compression = require('compression');
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 4000);

  // Sentry
  const dsn = config.get<string>('SENTRY_DSN');
  if (dsn) Sentry.init({ dsn });

  // Security
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Validation — whitelist:false so GraphQL InputType fields without decorators are not stripped
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));

  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}/graphql`);
}

bootstrap();
