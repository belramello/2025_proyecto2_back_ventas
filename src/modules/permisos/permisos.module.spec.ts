/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// --- MOCKS DE MÓDULOS ---
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
import { PermisosController } from './permisos.controller';
import { PermisosService } from './permisos.service';
import { PermisosValidator } from './helpers/permisos-validator';
import { RolesValidator } from '../roles/helpers/roles-validator';
import { IPermisosRepository } from './repositories/permisos-repository.interface';
// ¡AÑADIDOS!
import { JwtService } from '../jwt/jwt.service';
import { UsuarioService } from '../usuario/usuario.service';

// --- MOCK PROVIDERS ---
const mockPermisosRepository = {};
const mockRolesValidator = {};
// ¡AÑADIDOS!
const mockJwtService = {};
const mockUsuarioService = {};

// --- TEST SUITE ---
describe('PermisosModule', () => {
  let module: TestingModule;
  let controller: PermisosController;
  let service: PermisosService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [PermisosController],
      providers: [
        PermisosService,
        PermisosValidator,
        {
          provide: 'IPermisosRepository',
          useValue: mockPermisosRepository,
        },
        {
          provide: RolesValidator,
          useValue: mockRolesValidator,
        },
        // --- ¡CORRECCIÓN AQUÍ! ---
        // Proveemos los mocks para las dependencias del AuthGuard
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
      ],
    }).compile();

    controller = module.get<PermisosController>(PermisosController);
    service = module.get<PermisosService>(PermisosService);
  });

  it('debería compilar el módulo exitosamente', () => {
    expect(module).toBeDefined();
  });

  it('debería resolver (inyectar) PermisosController', () => {
    expect(controller).toBeDefined();
  });

  it('debería resolver (inyectar) PermisosService', () => {
    expect(service).toBeDefined();
  });

  it('debería resolver (inyectar) PermisosValidator', () => {
    const validator = module.get<PermisosValidator>(PermisosValidator);
    expect(validator).toBeDefined();
  });

  it('debería resolver (inyectar) IPermisosRepository (como mock)', () => {
    const repository = module.get<IPermisosRepository>('IPermisosRepository');
    expect(repository).toBeDefined();
    expect(repository).toBe(mockPermisosRepository);
  });

  it('debería inyectar mocks correctamente en los servicios', () => {
    expect(service['permisosRepository']).toBe(mockPermisosRepository);
    const validator = module.get<PermisosValidator>(PermisosValidator);
    expect(validator['rolesValidator']).toBe(mockRolesValidator);
  });
});
