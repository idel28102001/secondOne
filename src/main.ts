import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './common/config';
import { MyLogger } from './common/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: config.get<string>('ENV') === 'PROD' ? new MyLogger() : ['error', 'warn', 'log'],
  });
  await app.listen(5502);
}
bootstrap();
