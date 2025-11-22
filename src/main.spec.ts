// --- MOCKS ---

// Seteamos el NODE_ENV al inicio para cualquier import
// que pueda ocurrir en segundo plano
process.env.NODE_ENV = 'test';

import { Module } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Module({})
class FakeAppModule {}

jest.mock('./app.module', () => ({
  AppModule: FakeAppModule,
}));

// 1. Definir contenedores y valores mock
const mockAppContainer = {
  app: null as any,
};
const mockConfig = { mock: 'config' };
const mockDocument = { mock: 'document' };
const mockDocumentBuilder = {
  setTitle: jest.fn().mockReturnThis(),
  setDescription: jest.fn().mockReturnThis(),
  setVersion: jest.fn().mockReturnThis(),
  addTag: jest.fn().mockReturnThis(),
  build: jest.fn().mockImplementation(() => mockConfig),
};

// 2. Mock de NestFactory
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockImplementation(() => Promise.resolve(mockAppContainer.app)),
  },
}));

// 3. Mock de typeorm-transactional
jest.mock('typeorm-transactional', () => ({
  initializeTransactionalContext: jest.fn(),
  addTransactionalDataSource: jest.fn(),
}));

// 4. Mock de class-validator
jest.mock('class-validator', () => ({
  useContainer: jest.fn(),
}));

// 5. Mock de Swagger (con ApiProperty)
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger, // Mantiene ApiProperty, ApiTags, etc.
  SwaggerModule: {
    createDocument: jest.fn().mockImplementation(() => mockDocument),
    setup: jest.fn(),
  },
  DocumentBuilder: jest.fn().mockImplementation(() => mockDocumentBuilder),
}));

// Importamos el resto de las dependencias
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';

describe('main.ts (bootstrap)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Aseguramos que NODE_ENV sea 'test'
    process.env = { ...originalEnv, NODE_ENV: 'test' };

    // Limpiamos los mocks del builder
    mockDocumentBuilder.setTitle.mockClear();
    mockDocumentBuilder.setDescription.mockClear();
    mockDocumentBuilder.setVersion.mockClear();
    mockDocumentBuilder.addTag.mockClear();
    mockDocumentBuilder.build.mockClear();

    // Llenamos el contenedor ANTES de cada test
    mockAppContainer.app = {
      select: jest.fn(),
      useStaticAssets: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      get: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    mockAppContainer.app.select.mockReturnValue(mockAppContainer.app);
  });

  afterAll(() => {
    // Restauramos el env
    process.env = originalEnv;
  });

  const checkCommonAssertions = () => {
    const mockApp = mockAppContainer.app;
    
    expect(initializeTransactionalContext).toHaveBeenCalled();
    
    expect(NestFactory.create).toHaveBeenCalledWith(FakeAppModule);
    expect(mockApp.select).toHaveBeenCalledWith(FakeAppModule);
    expect(useContainer).toHaveBeenCalledWith(mockApp, {
      fallbackOnErrors: true,
    });
    // El resto de las aserciones
    expect(mockApp.useStaticAssets).toHaveBeenCalledWith(expect.stringContaining('uploads'));
    expect(mockApp.enableCors).toHaveBeenCalled();
    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));
    expect(mockApp.get).toHaveBeenCalledWith(DataSource);
    expect(addTransactionalDataSource).toHaveBeenCalled();
    expect(DocumentBuilder).toHaveBeenCalled();
    expect(mockDocumentBuilder.setTitle).toHaveBeenCalledWith('API de Gestión de Ventas');
    expect(mockDocumentBuilder.build).toHaveBeenCalled();
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(mockApp, mockConfig);
    expect(SwaggerModule.setup).toHaveBeenCalledWith('api', mockApp, mockDocument);
  };

  it('debería inicializar la app y escuchar en el puerto 3000 (default)', async () => {
    delete process.env.PORT;

    // CORREGIDO: Importamos aquí. 'require' no es hoisteado
    // y se ejecutará DESPUÉS de que beforeEach haya corrido.
    const { bootstrap } = require('./main');
    await bootstrap();

    checkCommonAssertions();
    expect(mockAppContainer.app.listen).toHaveBeenCalledWith(3000);
  });

  it('debería inicializar la app y escuchar en process.env.PORT', async () => {
    process.env.PORT = '5000';

    // CORREGIDO: Importamos aquí.
    const { bootstrap } = require('./main');
    await bootstrap();

    checkCommonAssertions();
    expect(mockAppContainer.app.listen).toHaveBeenCalledWith('5000');
  });
});
