/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
// --- MOCKS DE MÓDULOS ---
// 1. Mockear Swagger para evitar el crash de importación
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger, // Mantiene ApiProperty, ApiTags, etc.
  SwaggerModule: {
    createDocument: jest.fn(),
    setup: jest.fn(),
  },
  DocumentBuilder: jest.fn(() => ({
    build: jest.fn(),
  })),
}));

// 2. Mockear el helper de password
import * as passwordHelper from './helpers/password-helper';
jest.mock('./helpers/password-helper', () => ({
  __esModule: true,
  hashPassword: jest.fn(),
  comparePasswords: jest.fn(),
}));
const mockedHashPassword = passwordHelper.hashPassword as jest.Mock;

// --- IMPORTS REALES ---
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '../jwt/jwt.service';
import { UsuarioService } from '../usuario/usuario.service';
import { AuthValidator } from './helpers/auth-validator';
import { AuthMapper } from './mappers/auth-mapper';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from '../usuario/dto/login.dto';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { Usuario } from '../usuario/entities/usuario.entity';
import { LoginResponseDto } from '../usuario/dto/login-response.dto';
import { RespuestaUsuarioDto } from '../usuario/dto/respuesta-usuario.dto';

// (El resto de tus mocks de datos y providers permanece igual)

// --- MOCK DATA ---
const mockUser: Usuario = {
  id: 1,
  nombre: 'Alejo',
  apellido: 'De Miguel',
  email: 'test@test.com',
  password: 'hashed_password',
  rol: {
    id: 1,
    nombre: 'Admin',
    permisos: [{ id: 1, nombre: 'permiso1' }],
  },
  isDeleted: false,
};
const mockRespuestaUsuario: RespuestaUsuarioDto = {
  id: 1,
  nombre: 'Alejo',
  apellido: 'De Miguel',
  email: 'test@test.com',
  rol: {
    id: 1,
    nombre: 'Admin',
    permisos: [{ id: 1, nombre: 'permiso1' }],
  },
};
const mockLoginResponse: LoginResponseDto = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  usuario: {
    id: 1,
    nombre: 'Alejo',
    email: 'test@test.com',
    rol: 'Admin',
    permisos: [1],
  },
};

// --- MOCK PROVIDERS ---
const mockJwtService = {
  generateToken: jest.fn(),
  refreshToken: jest.fn(),
  getPayload: jest.fn(),
};
const mockUserService = {
  createUsuario: jest.fn(),
};
const mockAuthValidator = {
  validarEmailExistente: jest.fn(),
  validarContraseñaCorrecta: jest.fn(),
  validarEmailSinUsar: jest.fn(),
  validarUsuarioExistente: jest.fn(),
};
const mockAuthMapper = {
  toLoginResponseDto: jest.fn(),
};
const mockHistorialService = {
  create: jest.fn(),
};

// --- TEST SUITE ---
describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let authValidator: AuthValidator;
  let authMapper: AuthMapper;
  let historialActividades: HistorialActividadesService;
  let userService: UsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsuarioService, useValue: mockUserService },
        { provide: AuthValidator, useValue: mockAuthValidator },
        { provide: AuthMapper, useValue: mockAuthMapper },
        {
          provide: HistorialActividadesService,
          useValue: mockHistorialService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    authValidator = module.get<AuthValidator>(AuthValidator);
    authMapper = module.get<AuthMapper>(AuthMapper);
    historialActividades = module.get<HistorialActividadesService>(
      HistorialActividadesService,
    );
    userService = module.get<UsuarioService>(UsuarioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockedHashPassword.mockClear();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // (Las pruebas de 'login' y 'register' están bien y no cambian)
  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@test.com',
      password: 'password123',
    };
    const payload = { email: mockUser.email, sub: mockUser.id.toString() };

    it('debería loguear al usuario y registrar el historial exitosamente', async () => {
      mockAuthValidator.validarEmailExistente.mockResolvedValue(mockUser);
      mockAuthValidator.validarContraseñaCorrecta.mockResolvedValue(undefined);
      mockHistorialService.create.mockResolvedValue(undefined);
      mockJwtService.generateToken
        .mockReturnValueOnce('access_token') // auth
        .mockReturnValueOnce('refresh_token'); // refresh
      mockAuthMapper.toLoginResponseDto.mockReturnValue(mockLoginResponse);

      const result = await service.login(loginDto);

      expect(authValidator.validarEmailExistente).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(authValidator.validarContraseñaCorrecta).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(historialActividades.create).toHaveBeenCalledWith({
        usuario: mockUser.id,
        accionId: 1,
        estadoId: 1,
      });
      expect(jwtService.generateToken).toHaveBeenCalledWith(payload, 'auth');
      expect(jwtService.generateToken).toHaveBeenCalledWith(payload, 'refresh');
      expect(authMapper.toLoginResponseDto).toHaveBeenCalledWith(
        'access_token',
        'refresh_token',
        mockUser,
      );
      expect(result).toEqual(mockLoginResponse);
    });

    it('debería fallar si el email no existe y NO registrar historial', async () => {
      const error = new NotFoundException('Usuario con email no encontrado');
      mockAuthValidator.validarEmailExistente.mockRejectedValue(error);

      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);

      expect(authValidator.validarEmailExistente).toHaveBeenCalledTimes(2);
      expect(authValidator.validarContraseñaCorrecta).not.toHaveBeenCalled();
      expect(historialActividades.create).not.toHaveBeenCalled();
    });

    it('debería fallar si la contraseña es incorrecta y registrar historial de fallo', async () => {
      const error = new BadRequestException('Contraseña incorrecta');
      mockAuthValidator.validarEmailExistente.mockResolvedValueOnce(mockUser);
      mockAuthValidator.validarContraseñaCorrecta.mockRejectedValue(error);
      mockAuthValidator.validarEmailExistente.mockResolvedValueOnce(mockUser);
      mockHistorialService.create.mockResolvedValue(undefined);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(authValidator.validarEmailExistente).toHaveBeenCalledTimes(2);
      expect(authValidator.validarContraseñaCorrecta).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(historialActividades.create).toHaveBeenCalledWith({
        usuario: mockUser.id,
        accionId: 1,
        estadoId: 2,
      });
      expect(jwtService.generateToken).not.toHaveBeenCalled();
      expect(authMapper.toLoginResponseDto).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const createUserDto: CreateUsuarioDto = {
      nombre: 'Alejo',
      apellido: 'De Miguel',
      email: 'test@test.com',
      password: 'password123',
      rolId: 1,
    };
    const hashedPassword = 'hashed_password_new';
    const payload = {
      email: mockRespuestaUsuario.email,
      sub: mockRespuestaUsuario.id.toString(),
    };

    it('debería registrar un nuevo usuario exitosamente', async () => {
      mockAuthValidator.validarEmailSinUsar.mockResolvedValue(null);
      mockedHashPassword.mockResolvedValue(hashedPassword);
      mockUserService.createUsuario.mockResolvedValue(mockRespuestaUsuario);
      mockHistorialService.create.mockResolvedValue(undefined);
      mockJwtService.generateToken
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');
      mockAuthMapper.toLoginResponseDto.mockReturnValue(mockLoginResponse);

      const result = await service.register(createUserDto);

      expect(authValidator.validarEmailSinUsar).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(mockedHashPassword).toHaveBeenCalledWith(createUserDto.password);
      expect(userService.createUsuario).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(historialActividades.create).toHaveBeenCalledWith({
        usuario: mockRespuestaUsuario.id,
        accionId: 17,
        estadoId: 1,
      });
      expect(jwtService.generateToken).toHaveBeenCalledWith(payload, 'auth');
      expect(jwtService.generateToken).toHaveBeenCalledWith(payload, 'refresh');
      expect(authMapper.toLoginResponseDto).toHaveBeenCalledWith(
        'access_token',
        'refresh_token',
        mockRespuestaUsuario,
      );
      expect(result).toEqual(mockLoginResponse);
    });

    it('debería fallar si el email ya está en uso', async () => {
      const error = new BadRequestException('El email ya está en uso');
      mockAuthValidator.validarEmailSinUsar.mockRejectedValue(error);

      await expect(service.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockedHashPassword).not.toHaveBeenCalled();
      expect(userService.createUsuario).not.toHaveBeenCalled();
      expect(historialActividades.create).not.toHaveBeenCalled();
      expect(jwtService.generateToken).not.toHaveBeenCalled();
    });
  });

  // Pruebas para el método refresh()
  describe('refresh', () => {
    const oldRefreshToken = 'old_refresh_token';
    const payload = { sub: '1', email: 'test@test.com' };

    it('debería refrescar el token (sin generar nuevo refresh)', async () => {
      const tokens = { accessToken: 'new_access_token' }; // Sin refreshToken
      mockJwtService.refreshToken.mockReturnValue(tokens);
      mockJwtService.getPayload.mockReturnValue(payload);
      mockAuthValidator.validarUsuarioExistente.mockResolvedValue(mockUser);
      mockAuthMapper.toLoginResponseDto.mockReturnValue(mockLoginResponse);

      const result = await service.refresh(oldRefreshToken);

      expect(jwtService.refreshToken).toHaveBeenCalledWith(oldRefreshToken);
      expect(jwtService.getPayload).toHaveBeenCalledWith(
        oldRefreshToken,
        'refresh',
      );
      expect(authValidator.validarUsuarioExistente).toHaveBeenCalledWith(
        parseInt(payload.sub),
      );
      expect(authMapper.toLoginResponseDto).toHaveBeenCalledWith(
        tokens.accessToken,
        oldRefreshToken,
        mockUser,
      );
      expect(result).toEqual(mockLoginResponse);
    });

    it('debería refrescar el token (generando nuevo refresh)', async () => {
      const tokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      };
      mockJwtService.refreshToken.mockReturnValue(tokens);
      mockJwtService.getPayload.mockReturnValue(payload);
      mockAuthValidator.validarUsuarioExistente.mockResolvedValue(mockUser);
      mockAuthMapper.toLoginResponseDto.mockReturnValue(mockLoginResponse);

      const result = await service.refresh(oldRefreshToken);

      expect(authMapper.toLoginResponseDto).toHaveBeenCalledWith(
        tokens.accessToken,
        tokens.refreshToken,
        mockUser,
      );
      expect(result).toEqual(mockLoginResponse);
    });

    it('debería fallar si el token de refresh es inválido', async () => {
      const error = new UnauthorizedException('Token de refresh inválido');

      // --- ESTA ES LA CORRECCIÓN ---
      // Tu JwtService.refreshToken TIRA (throws) un error síncrono,
      // no devuelve una promesa rechazada. El mock debe hacer lo mismo.
      mockJwtService.refreshToken.mockImplementation(() => {
        throw error;
      });
      // -----------------------------

      // El AuthService.refresh (que es async) atrapará este error síncrono
      // y lo convertirá en una promesa rechazada, que expect().rejects atrapará.
      await expect(service.refresh(oldRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );

      // Como la función falló en la primera línea, el resto no debe llamarse
      expect(jwtService.getPayload).not.toHaveBeenCalled();
      expect(authValidator.validarUsuarioExistente).not.toHaveBeenCalled();
      expect(authMapper.toLoginResponseDto).not.toHaveBeenCalled();
    });

    it('debería fallar si el usuario del payload no existe', async () => {
      const tokens = { accessToken: 'new_access_token' };
      const error = new NotFoundException('Usuario no encontrado');
      mockJwtService.refreshToken.mockReturnValue(tokens);
      mockJwtService.getPayload.mockReturnValue(payload);
      mockAuthValidator.validarUsuarioExistente.mockRejectedValue(error);

      await expect(service.refresh(oldRefreshToken)).rejects.toThrow(
        NotFoundException,
      );

      expect(authMapper.toLoginResponseDto).not.toHaveBeenCalled();
    });
  });
});
