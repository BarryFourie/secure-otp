import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin:'https://barry-8081.entrostat.dev',
    methods:'POST',
    credentials: true
  })
  await app.listen(8080);
}
bootstrap();
