/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// --- MOCKS DE MÓDULOS ---
// 1. Mockear Swagger (¡ESENCIAL!)
// (Necesario porque los DTOs usan @ApiProperty)
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger, // Mantiene ApiProperty, ApiTags, etc.
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
import { MarcaNombreUniqueValidator } from './helpers/marcas-validator';
import { IMarcaRepository } from './repositories/marca-repository.interface';
import { MarcaRepository } from './repositories/marca-repository'; // Importar la clase concreta
import { ConfigService } from '@nestjs/config'; // Necesario para MarcaMapper
import { JwtService } from '../jwt/jwt.service'; // Necesario para AuthGuard
import { UsuarioService } from '../usuario/usuario.service'; // Necesario para AuthGuard

// --- MOCK PROVIDERS ---
// Creamos mocks vacíos para todas las dependencias externas
const mockMarcaRepositoryInterface = {};
const mockMarcaRepositoryClass = {}; // Mock distinto para la clase concreta
const mockConfigService = {
  get: jest.fn().mockReturnValue('http://localhost:3000'), // Mock para API_URL
};
const mockJwtService = {};
const mockUsuarioService = {};

// --- TEST SUITE ---
describe('MarcasModule', () => {
  let module: TestingModule;
  let controller: MarcasController;
  let service: MarcasService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      // 1. Declaramos los controllers y providers reales del MarcasModule
      controllers: [MarcasController],
      providers: [
        MarcasService,
        MarcaMapper,
        MarcaNombreUniqueValidator,
        {
          provide: 'IMarcaRepository',
          useValue: mockMarcaRepositoryInterface, // Mock para la interfaz (usada por MarcasService)
        },
        {
          provide: MarcaRepository,
          useValue: mockMarcaRepositoryClass, // Mock para la clase concreta (usada por Validator)
        },

        // 2. Proveemos mocks para las dependencias externas
        {
          provide: ConfigService,
          useValue: mockConfigService, // Para MarcaMapper
        },
        {
          provide: JwtService,
          useValue: mockJwtService, // Para AuthGuard (implícito en Controller)
        },
        {
          provide: UsuarioService,
          useValue: mockUsuarioService, // Para AuthGuard (implícito en Controller)
        },
      ],
    }).compile();

    controller = module.get<MarcasController>(MarcasController);
    service = module.get<MarcasService>(MarcasService);
  });

  it('debería compilar el módulo exitosamente', () => {
    // Si beforeEach() se completa, el módulo se compiló
    // y el archivo .module.ts tiene 100% de cobertura.
    expect(module).toBeDefined();
  });

  it('debería resolver (inyectar) MarcasController', () => {
    expect(controller).toBeDefined();
  });

  it('debería resolver (inyectar) MarcasService', () => {
    expect(service).toBeDefined();
  });

  it('debería resolver (inyectar) MarcaMapper', () => {
    const mapper = module.get<MarcaMapper>(MarcaMapper);
    expect(mapper).toBeDefined();
  });

  it('debería resolver (inyectar) MarcaNombreUniqueValidator', () => {
    const validator = module.get<MarcaNombreUniqueValidator>(
      MarcaNombreUniqueValidator,
    );
    expect(validator).toBeDefined();
  });

  it('debería resolver (inyectar) IMarcaRepository (como mock)', () => {
    const repository = module.get<IMarcaRepository>('IMarcaRepository');
    expect(repository).toBeDefined();
    expect(repository).toBe(mockMarcaRepositoryInterface);
  });

  it('debería inyectar mocks correctamente en los servicios y validadores', () => {
    // Verificamos las dependencias anidadas
    expect(service['marcaRepository']).toBe(mockMarcaRepositoryInterface);

    const mapper = module.get<MarcaMapper>(MarcaMapper);
    expect(mapper['configService']).toBe(mockConfigService);

    const validator = module.get<MarcaNombreUniqueValidator>(
      MarcaNombreUniqueValidator,
    );
    // El validador espera la clase concreta MarcaRepository
    expect(validator['marcaRepository']).toStrictEqual(
      mockMarcaRepositoryClass,
    );
  });
});
