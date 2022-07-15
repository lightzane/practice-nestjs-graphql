import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger(`Server`);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
  logger.debug(`🚀 Running on http://localhost:3000/graphql`);
}
bootstrap();
