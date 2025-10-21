import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { join } from 'path';
export async function bootstrap() {
  //Para poder utilizar @Transactional()
  initializeTransactionalContext();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'));
  app.enableCors(); // Habilita CORS para el frontend
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // lanza error si vienen propiedades extra
      transform: true, // transforma tipos automáticamente (string → number, string → Date, etc.)
    }),
  );
  //Para poder utilizar @Transactional()
  const dataSource = app.get(DataSource);
  addTransactionalDataSource(dataSource);

  // Configuración básica de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Gestión de Ventas')
    .setDescription(
      'Aplicación para gestionar productos, marcas, lineas, proveedores y ventas',
    )
    .setVersion('1.0')
    .addTag('IMC')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
