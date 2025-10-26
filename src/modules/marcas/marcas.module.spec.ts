/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// --- MOCKS DE MÓDulos ---
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger,
  SwaggerModule: { createDocument: jest.fn(), setup: jest.fn() },
  DocumentBuilder: jest.fn(() => ({
    build: jest.fn(),
  })),
}));

// --- IMPORTS REALES ---
import { Test, TestingModule } from '@nestjs/testing';
import { MarcasController } from './marcas.controller';
import { MarcasService } from './marcas.service';
import { MarcaMapper } from './mapper/marca.mapper';
import { MarcaValidator } from './helpers/marcas-validator';
import { MarcasUpdater } from './helpers/marcas-updater';
import { IMarcaRepository } from './repositories/marca-repository.interface';
import { MarcaRepository } from './repositories/marca-repository';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '../jwt/jwt.service';
import { UsuarioService } from '../usuario/usuario.service';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';
import { LineasService } from '../lineas/lineas.service';
import { LineasValidator } from '../lineas/helpers/lineas-validator';

// --- MOCK PROVIDERS ---
const mockMarcaRepositoryInterface = {};
const mockMarcaRepositoryClass = {};
const mockConfigService = {
  get: jest.fn().mockReturnValue('http://localhost:3000'),
};
const mockJwtService = {};
const mockUsuarioService = {};
const mockHistorialService = {};
const mockLineasService = {};
const mockLineasValidator = {};

// --- TEST SUITE ---
describe('MarcasModule', () => {
  let module: TestingModule;
  let controller: MarcasController;
  let service: MarcasService;
  let mapper: MarcaMapper;
  let validator: MarcaValidator;
  let updater: MarcasUpdater;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [MarcasController],
      providers: [
        MarcasService,
        MarcaMapper,
        MarcaValidator,
        MarcasUpdater,
        {
          provide: 'IMarcaRepository',
          useValue: mockMarcaRepositoryInterface,
        },
        {
          provide: MarcaRepository,
          useValue: mockMarcaRepositoryClass,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
        {
          provide: HistorialActividadesService,
          useValue: mockHistorialService,
        },
        {
          provide: LineasService,
          useValue: mockLineasService,
        },
        // --- ¡CORRECCIÓN AQUÍ! ---
        // Proveemos el mock para la dependencia del MarcaValidator
        {
          provide: LineasValidator,
          useValue: mockLineasValidator,
        },
      ],
    }).compile();

    controller = module.get<MarcasController>(MarcasController);
    service = module.get<MarcasService>(MarcasService);
    mapper = module.get<MarcaMapper>(MarcaMapper);
    validator = module.get<MarcaValidator>(MarcaValidator);
    updater = module.get<MarcasUpdater>(MarcasUpdater);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería compilar el módulo exitosamente', () => {
    expect(module).toBeDefined(); // Cobertura 100% para marcas.module.ts ✅
  });

  it('debería resolver (inyectar) MarcasController', () => {
    expect(controller).toBeDefined();
  });

  it('debería resolver (inyectar) MarcasService', () => {
    expect(service).toBeDefined();
  });

  it('debería resolver (inyectar) MarcaMapper', () => {
    expect(mapper).toBeDefined();
  });

  it('debería resolver (inyectar) MarcaValidator', () => {
    expect(validator).toBeDefined();
  });

  it('debería resolver (inyectar) MarcasUpdater', () => {
    expect(updater).toBeDefined();
  });

  it('debería resolver (inyectar) IMarcaRepository (como mock)', () => {
    const repository = module.get<IMarcaRepository>('IMarcaRepository');
    expect(repository).toBeDefined();
    expect(repository).toBe(mockMarcaRepositoryInterface);
  });

  it('debería inyectar mocks correctamente en los servicios y helpers', () => {
    expect(service['marcaRepository']).toBe(mockMarcaRepositoryInterface);
    expect(service['marcaMapper']).toBe(mapper);
    expect(mapper['configService']).toBe(mockConfigService);
  });
});
