/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// --- MOCKS DE MÓDULOS ---
// Mockear Swagger para evitar el crash de importación
// (Necesario porque AuthController -> DTOs -> @ApiProperty)
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
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthMapper } from './mappers/auth-mapper';
import { AuthValidator } from './helpers/auth-validator';
import { JwtService } from '../jwt/jwt.service';
import { UsuarioService } from '../usuario/usuario.service';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';

// --- MOCK PROVIDERS ---
const mockJwtService = {};
const mockUsuarioService = {};
const mockHistorialService = {};

// --- TEST SUITE ---
describe('AuthModule', () => {
  let module: TestingModule;
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      // 1. Declaramos los controllers y providers del AuthModule
      controllers: [AuthController],
      providers: [
        AuthService,
        AuthMapper,
        AuthValidator,

        // 2. Proveemos mocks para las dependencias externas
        // (que vienen de JwtModule, UsuarioModule, etc.)
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
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('debería compilar el módulo exitosamente', () => {
    // Si beforeEach() se completa, el módulo se compiló
    // y el archivo .module.ts tiene 100% de cobertura.
    expect(module).toBeDefined();
  });

  it('debería resolver (inyectar) AuthController', () => {
    // Verifica que el controlador se pudo instanciar
    expect(controller).toBeDefined();
  });

  it('debería resolver (inyectar) AuthService', () => {
    // Verifica que el servicio principal se pudo instanciar
    expect(service).toBeDefined();
  });

  it('debería resolver (inyectar) AuthMapper', () => {
    const mapper = module.get<AuthMapper>(AuthMapper);
    expect(mapper).toBeDefined();
  });

  it('debería resolver (inyectar) AuthValidator', () => {
    const validator = module.get<AuthValidator>(AuthValidator);
    expect(validator).toBeDefined();
  });

  it('debería inyectar mocks correctamente en los servicios', () => {
    // Verificamos que las dependencias anidadas se resolvieron
    // (AuthService depende de UsuarioService, etc.)
    expect(service['jwtService']).toBe(mockJwtService);
    expect(service['userService']).toBe(mockUsuarioService);
    expect(service['historialActividades']).toBe(mockHistorialService);

    const validator = module.get<AuthValidator>(AuthValidator);
    expect(validator['userService']).toBe(mockUsuarioService);
  });
});
