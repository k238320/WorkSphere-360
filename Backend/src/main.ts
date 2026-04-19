import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { contentParser } from 'fastify-multer';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.register(contentParser);

  app.useStaticAssets({ root: join(__dirname, '../../fastify-file-upload') });
  // app.register(fmp);
  app.enableCors();

  await app.listen(process.env.PORT, '0.0.0.0').then(() => {
    console.log('server is runnig at port ', process.env.PORT);
  });
}
bootstrap();
