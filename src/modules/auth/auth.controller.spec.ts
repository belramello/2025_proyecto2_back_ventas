/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// --- MOCKS DE MÓDULOS ---
// 1. Mockear Swagger para evitar el crash de importación
// (Necesario porque los DTOs usan @ApiProperty)
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger, // Mantiene ApiProperty, ApiTags, etc.
  SwaggerModule: {
    createDocument: jest.fn(),
    setup: jest.fn(),
  },
  DocumentBuilder: jest.fn(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    build: jest.fn(),
  })),
}));

// --- IMPORTS REALES ---
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from '../usuario/dto/login.dto';
import { LoginResponseDto } from '../usuario/dto/login-response.dto';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';

// --- MOCK DATA ---

const mockLoginDto: LoginDto = {
  email: 'test@test.com',
  password: 'password123',
};

const mockCreateDto: CreateUsuarioDto = {
  nombre: 'Alejo',
  apellido: 'De Miguel',
  email: 'new@test.com',
  password: 'new_password123',
  rolId: 1,
};

const mockLoginResponse: LoginResponseDto = {
  accessToken: 'mock_access_token',
  refreshToken: 'mock_refresh_token',
  usuario: {
    id: 1,
    nombre: 'Alejo',
    email: 'test@test.com',
    rol: 'Admin',
    permisos: [1],
  },
};

// --- MOCK PROVIDERS ---

// Mockeamos los métodos públicos del AuthService
const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  refresh: jest.fn(),
};

// --- TEST SUITE ---

describe('AuthController', () => {
  let controller: AuthController;
  let service: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  // Pruebas para el método login()
  describe('login', () => {
    it('debería llamar a authService.login y retornar el resultado', async () => {
      // Arrange
      service.login.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(mockLoginDto);

      // Assert
      expect(service.login).toHaveBeenCalledTimes(1);
      expect(service.login).toHaveBeenCalledWith(mockLoginDto);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  // Pruebas para el método register()
  describe('register', () => {
    it('debería llamar a authService.register y retornar el resultado', async () => {
      // Arrange
      service.register.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.register(mockCreateDto);

      // Assert
      expect(service.register).toHaveBeenCalledTimes(1);
      expect(service.register).toHaveBeenCalledWith(mockCreateDto);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  // Pruebas para el método refresh()
  describe('refresh', () => {
    it('debería llamar a authService.refresh y retornar el resultado', async () => {
      const refreshToken = 'some_refresh_token';
      // Arrange
      service.refresh.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.refresh(refreshToken);

      // Assert
      expect(service.refresh).toHaveBeenCalledTimes(1);
      expect(service.refresh).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual(mockLoginResponse);
    });
  });
});
