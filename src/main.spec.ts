// src/main.spec.ts

import { ValidationPipe } from '@nestjs/common';
// Asegúrate que AppModule se importe, pero puede necesitar ir después de los mocks si hay problemas de dependencia circular
import { AppModule } from './app.module'; 

// 1. Mocks de la aplicación y NestFactory (Mantenlos al principio)
const mockApp = {
  listen: jest.fn().mockResolvedValue(true),
  enableCors: jest.fn(),
  useGlobalPipes: jest.fn(),
  get: jest.fn(),
  close: jest.fn().mockResolvedValue(true),
};

const mockNestFactory = {
  create: jest.fn().mockResolvedValue(mockApp),
};

// 2. Mockeamos el módulo principal de NestJS. (Este es el punto de conflicto)
jest.mock('@nestjs/core', () => ({
  NestFactory: mockNestFactory, // Referencia a la variable ya definida
}));

// 3. Mockeamos las clases de Swagger.
const mockSwaggerModule = {
  createDocument: jest.fn().mockReturnValue({}),
  setup: jest.fn(),
};

jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: mockSwaggerModule,
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  })),
}));

describe('main.ts', () => {
  it('debe inicializar la aplicación, configurar pipes, Swagger y escuchar en el puerto', async () => {
    // 1. Importar/requerir el archivo principal para ejecutar el `bootstrap()` que está al final.
    // Esto ejecuta la función bootstrap en tu main.ts
    // Si tienes un error de `require('./main')` con TypeScript, puedes crear un archivo temporal
    // `main-wrapper.js` que solo llama a `require('./main')`.
    require('./main');

    // Esperamos un ciclo para que el async/await del bootstrap() se complete
    await new Promise(resolve => setTimeout(resolve, 10)); 

    // Verificaciones (sin cambios)
    expect(mockNestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockApp.enableCors).toHaveBeenCalled();
    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));
    expect(mockSwaggerModule.createDocument).toHaveBeenCalled();
    expect(mockSwaggerModule.setup).toHaveBeenCalledWith('api', mockApp, expect.any(Object));
    expect(mockApp.listen).toHaveBeenCalledWith(process.env.PORT ?? 3000);
  });
});