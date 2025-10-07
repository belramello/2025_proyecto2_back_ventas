import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule,
  DocumentBuilder
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API de Ventas')
    .setDescription('Documentación de la API del proyecto de ventas')
    .setVersion('1.0')
    .addTag('ventas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
