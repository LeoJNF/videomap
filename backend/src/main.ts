import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS configurado
  app.enableCors({
    origin: '*',
    credentials: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ✅ Server escutando em todas as interfaces
  const port = parseInt(process.env.PORT || '7000', 10);
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Backend rodando em http://localhost:${port}`);
}

bootstrap();