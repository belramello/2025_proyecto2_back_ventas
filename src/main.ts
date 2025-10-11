import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.enableCors(); // Habilita CORS para el frontend
  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,            // elimina propiedades que no están en el DTO
    forbidNonWhitelisted: true, // lanza error si vienen propiedades extra
    transform: true,            // transforma tipos automáticamente (string → number, string → Date, etc.)
  }),
  );

  // Configuración básica de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Gestión de Ventas')
    .setDescription(
      'Aplicación para gestionar productos, marcas, lineas, proveedores  y ventas',
    )
    .setVersion('1.0')
    .addTag('IMC')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
