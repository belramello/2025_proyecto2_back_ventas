/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
// --- MOCKS DE MÓDULOS ---
// 1. Mockear Swagger (¡ESENCIAL!)
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger,
}));

// 2. Mockear bcrypt
const mockHash = jest.fn().mockResolvedValue('hashed_password');
const mockGenSalt = jest.fn().mockResolvedValue('salt');
jest.mock('bcrypt', () => ({
  hash: mockHash,
  genSalt: mockGenSalt,
  compare: jest.fn(),
}));

// 3. Mockear crypto (CORREGIDO CON mockImplementation)
const mockRandomBytesFn = jest
  .fn()
  .mockReturnValue({ toString: jest.fn().mockReturnValue('mock_token') });
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockImplementation((size) => mockRandomBytesFn(size)),
}));

// --- IMPORTS REALES ---
// (Imports sin cambios)
import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';
import { IUsuarioRepository } from './repositories/usuarios-repository.interface';
import { UsuariosMappers } from './mappers/usuarios.mappers';
import { UsuariosValidator } from './helpers/usuarios-validator';
import { UsuarioUpdater } from './helpers/usuario-updater';
import { MailService } from '../mails/mail.service';
import { ConfigService } from '@nestjs/config';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Rol } from '../roles/entities/rol.entity';
import { RespuestaUsuarioDto } from './dto/respuesta-usuario.dto';
import { PaginationDto } from '../ventas/dto/pagination.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// --- MOCK DATA --- (sin cambios)
const mockRol = { id: 1, nombre: 'Admin' } as Rol;
const mockUsuario = {
  id: 1,
  nombre: 'Test',
  apellido: 'User',
  email: 'test@test.com',
  password: 'hashed_password',
  rol: mockRol,
  fechaCreacion: new Date(),
  passwordResetToken: null,
  passwordResetExpiration: null,
} as Usuario;
const mockUsuarioWithToken = {
  ...mockUsuario,
  passwordResetToken: 'valid_token',
  passwordResetExpiration: new Date(Date.now() + 3600000),
} as Usuario;
const mockUsuarioWithExpiredToken = {
  ...mockUsuario,
  passwordResetToken: 'expired_token',
  passwordResetExpiration: new Date(Date.now() - 1000),
} as Usuario;
const mockCreateDto: CreateUsuarioDto = {
  nombre: 'New',
  apellido: 'User',
  email: 'new@test.com',
  password: 'password123',
  rolId: 1,
};
const mockUpdateDto: UpdateUsuarioDto = {
  nombre: 'Updated',
  email: 'updated@test.com',
};
const mockRespuestaUsuarioDto: RespuestaUsuarioDto = {
  id: 1,
  nombre: 'Test',
  apellido: 'User',
  email: 'test@test.com',
  fechaHoraCreacion: mockUsuario.fechaCreacion,
  rol: { id: 1, nombre: 'Admin', permisos: [] },
};
const mockPaginatedResult = {
  usuarios: [mockUsuario],
  total: 1,
  page: 1,
  lastPage: 1,
};
const mockMappedPaginatedResult = {
  usuarios: [mockRespuestaUsuarioDto],
  total: 1,
  page: 1,
  lastPage: 1,
};

// --- MOCK PROVIDERS --- (sin cambios)
const mockUsuariosRepository = {
  createUsuario: jest.fn(),
  findByEmail: jest.fn(),
  findOne: jest.fn(),
  findAllPaginated: jest.fn(),
  actualizarRolDeUsuario: jest.fn(),
  delete: jest.fn(),
  updateUsuario: jest.fn(),
  guardarTokenReset: jest.fn(),
  findOneByResetToken: jest.fn(),
  updatePassword: jest.fn(),
};
const mockUsuariosMappers = {
  toResponseDto: jest.fn(),
  toRespuestaFindAllPaginatedUsuariosDTO: jest.fn(),
};
const mockUsuariosValidator = {
  validateRolExistente: jest.fn(),
  validateUsuarioExistente: jest.fn(),
  validateEmailDisponible: jest.fn(),
};
const mockUsuarioUpdater = { aplicarActualizaciones: jest.fn() };
const mockMailService = { sendPasswordReset: jest.fn() };
const mockConfigService = { get: jest.fn() };
const mockHistorialService = { create: jest.fn() };

// --- TEST SUITE ---
describe('UsuarioService', () => {
  let service: UsuarioService;
  let repository: IUsuarioRepository;
  let mapper: UsuariosMappers;
  let validator: UsuariosValidator;
  let updater: UsuarioUpdater;
  let mailService: MailService;
  let configService: ConfigService;
  let historial: HistorialActividadesService;

  beforeEach(async () => {
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
    mockHash.mockClear();
    mockGenSalt.mockClear();

    // --- CORRECCIÓN AQUÍ ---
    // Limpiamos la variable correcta mockRandomBytesFn
    mockRandomBytesFn.mockClear();
    // Corregimos la referencia aquí también
    const mockReturnValue = mockRandomBytesFn.mock.results[0]?.value;
    if (
      mockReturnValue &&
      typeof mockReturnValue.toString === 'function' &&
      jest.isMockFunction(mockReturnValue.toString)
    ) {
      mockReturnValue.toString.mockClear();
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        { provide: 'IUsuarioRepository', useValue: mockUsuariosRepository },
        { provide: UsuariosMappers, useValue: mockUsuariosMappers },
        { provide: UsuariosValidator, useValue: mockUsuariosValidator },
        { provide: UsuarioUpdater, useValue: mockUsuarioUpdater },
        { provide: MailService, useValue: mockMailService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: HistorialActividadesService,
          useValue: mockHistorialService,
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    repository = module.get<IUsuarioRepository>('IUsuarioRepository');
    mapper = module.get<UsuariosMappers>(UsuariosMappers);
    validator = module.get<UsuariosValidator>(UsuariosValidator);
    updater = module.get<UsuarioUpdater>(UsuarioUpdater);
    mailService = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);
    historial = module.get<HistorialActividadesService>(
      HistorialActividadesService,
    );
  });

  // Asegúrate de limpiar también mockRandomBytesFn en afterEach si es necesario
  afterEach(() => {
    jest.clearAllMocks();
    // ... otros clear mocks ...

    // --- CORRECCIÓN AQUÍ ---
    mockRandomBytesFn.mockClear();
    // Corregimos la referencia aquí también
    const mockReturnValue = mockRandomBytesFn.mock.results[0]?.value;
    if (
      mockReturnValue &&
      typeof mockReturnValue.toString === 'function' &&
      jest.isMockFunction(mockReturnValue.toString)
    ) {
      mockReturnValue.toString.mockClear();
    }
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // (El resto de los tests 'describe' y 'it' permanecen exactamente iguales)
  // ... createUsuario ...
  describe('createUsuario', () => {
    it('debería validar rol, crear usuario y mapear respuesta', async () => {
      mockUsuariosValidator.validateRolExistente.mockResolvedValue(mockRol);
      mockUsuariosRepository.createUsuario.mockResolvedValue(mockUsuario);
      mockUsuariosMappers.toResponseDto.mockReturnValue(
        mockRespuestaUsuarioDto,
      );

      const result = await service.createUsuario(mockCreateDto);

      expect(validator.validateRolExistente).toHaveBeenCalledWith(
        mockCreateDto.rolId,
      );
      expect(repository.createUsuario).toHaveBeenCalledWith(
        mockCreateDto,
        mockRol,
      );
      expect(mapper.toResponseDto).toHaveBeenCalledWith(mockUsuario);
      expect(result).toEqual(mockRespuestaUsuarioDto);
    });

    it('debería fallar si validateRolExistente falla', async () => {
      const error = new NotFoundException('Rol no encontrado');
      mockUsuariosValidator.validateRolExistente.mockRejectedValue(error);

      await expect(service.createUsuario(mockCreateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.createUsuario).not.toHaveBeenCalled();
      expect(mapper.toResponseDto).not.toHaveBeenCalled();
    });

    it('debería propagar error si repository.createUsuario falla', async () => {
      const error = new InternalServerErrorException('DB error');
      mockUsuariosValidator.validateRolExistente.mockResolvedValue(mockRol); // Validación pasa
      mockUsuariosRepository.createUsuario.mockRejectedValue(error); // Repo falla

      await expect(service.createUsuario(mockCreateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mapper.toResponseDto).not.toHaveBeenCalled();
    });
  });
  // ... findAllPaginated ...
  describe('findAllPaginated', () => {
    it('debería obtener usuarios paginados (defaults) y mapear', async () => {
      mockUsuariosRepository.findAllPaginated.mockResolvedValue(
        mockPaginatedResult,
      );
      mockUsuariosMappers.toRespuestaFindAllPaginatedUsuariosDTO.mockReturnValue(
        mockMappedPaginatedResult,
      );

      const result = await service.findAllPaginated({});

      expect(repository.findAllPaginated).toHaveBeenCalledWith(1, 10);
      expect(
        mapper.toRespuestaFindAllPaginatedUsuariosDTO,
      ).toHaveBeenCalledWith(mockPaginatedResult);
      expect(result).toEqual(mockMappedPaginatedResult);
    });
    it('debería obtener usuarios paginados (provistos) y mapear', async () => {
      const dto: PaginationDto = { page: 3, limit: 5 };
      mockUsuariosRepository.findAllPaginated.mockResolvedValue(
        mockPaginatedResult,
      );
      mockUsuariosMappers.toRespuestaFindAllPaginatedUsuariosDTO.mockReturnValue(
        mockMappedPaginatedResult,
      );

      await service.findAllPaginated(dto);

      expect(repository.findAllPaginated).toHaveBeenCalledWith(3, 5);
    });
    it('debería propagar error si repository.findAllPaginated falla', async () => {
      const error = new Error('DB Error');
      mockUsuariosRepository.findAllPaginated.mockRejectedValue(error);
      await expect(service.findAllPaginated({})).rejects.toThrow(error);
      expect(
        mapper.toRespuestaFindAllPaginatedUsuariosDTO,
      ).not.toHaveBeenCalled();
    });
  });
  // ... findUsuario ...
  describe('findUsuario', () => {
    it('debería encontrar usuario por ID y mapear', async () => {
      mockUsuariosRepository.findOne.mockResolvedValue(mockUsuario);
      mockUsuariosMappers.toResponseDto.mockReturnValue(
        mockRespuestaUsuarioDto,
      );

      const result = await service.findUsuario(1);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(mapper.toResponseDto).toHaveBeenCalledWith(mockUsuario);
      expect(result).toEqual(mockRespuestaUsuarioDto);
    });
    it('debería lanzar NotFoundException si no lo encuentra', async () => {
      mockUsuariosRepository.findOne.mockResolvedValue(null);
      await expect(service.findUsuario(99)).rejects.toThrow(NotFoundException);
      await expect(service.findUsuario(99)).rejects.toThrow(
        'Usuario no encontrado',
      );
      expect(mapper.toResponseDto).not.toHaveBeenCalled();
    });
    it('debería propagar error si repository.findOne falla', async () => {
      const error = new Error('DB Error');
      mockUsuariosRepository.findOne.mockRejectedValue(error);
      await expect(service.findUsuario(1)).rejects.toThrow(error);
      expect(mapper.toResponseDto).not.toHaveBeenCalled();
    });
  });
  // ... findOne ...
  describe('findOne', () => {
    it('debería encontrar usuario por ID (entidad)', async () => {
      mockUsuariosRepository.findOne.mockResolvedValue(mockUsuario);
      const result = await service.findOne(1);
      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUsuario);
    });
    it('debería devolver null si no lo encuentra', async () => {
      mockUsuariosRepository.findOne.mockResolvedValue(null);
      const result = await service.findOne(99);
      expect(repository.findOne).toHaveBeenCalledWith(99);
      expect(result).toBeNull();
    });
    it('debería propagar error si repository.findOne falla', async () => {
      const error = new Error('DB Error');
      mockUsuariosRepository.findOne.mockRejectedValue(error);
      await expect(service.findOne(1)).rejects.toThrow(error);
    });
  });
  // ... actualizarRolDeUsuario ...
  describe('actualizarRolDeUsuario', () => {
    it('debería validar rol, usuario y llamar al repo', async () => {
      mockUsuariosValidator.validateRolExistente.mockResolvedValue(mockRol);
      mockUsuariosValidator.validateUsuarioExistente.mockResolvedValue(
        mockUsuario,
      );
      mockUsuariosRepository.actualizarRolDeUsuario.mockResolvedValue(
        undefined,
      );

      await service.actualizarRolDeUsuario(1, 1);

      expect(validator.validateRolExistente).toHaveBeenCalledWith(1);
      expect(validator.validateUsuarioExistente).toHaveBeenCalledWith(1);
      expect(repository.actualizarRolDeUsuario).toHaveBeenCalledWith(
        mockRol,
        mockUsuario,
      );
    });
    it('debería fallar si validateRolExistente falla', async () => {
      const error = new NotFoundException('Rol no existe');
      mockUsuariosValidator.validateRolExistente.mockRejectedValue(error);
      await expect(service.actualizarRolDeUsuario(1, 99)).rejects.toThrow(
        NotFoundException,
      );
      expect(validator.validateUsuarioExistente).not.toHaveBeenCalled();
      expect(repository.actualizarRolDeUsuario).not.toHaveBeenCalled();
    });
    it('debería fallar si validateUsuarioExistente falla', async () => {
      const error = new NotFoundException('Usuario no existe');
      mockUsuariosValidator.validateRolExistente.mockResolvedValue(mockRol); // Rol sí existe
      mockUsuariosValidator.validateUsuarioExistente.mockRejectedValue(error); // Usuario no
      await expect(service.actualizarRolDeUsuario(99, 1)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.actualizarRolDeUsuario).not.toHaveBeenCalled();
    });
    it('debería propagar error si repository.actualizarRolDeUsuario falla', async () => {
      const error = new Error('DB Error');
      mockUsuariosValidator.validateRolExistente.mockResolvedValue(mockRol);
      mockUsuariosValidator.validateUsuarioExistente.mockResolvedValue(
        mockUsuario,
      );
      mockUsuariosRepository.actualizarRolDeUsuario.mockRejectedValue(error); // Repo falla
      await expect(service.actualizarRolDeUsuario(1, 1)).rejects.toThrow(error);
    });
  });
  // ... update ...
  describe('update', () => {
    it('debería llamar al updater, repo y mapper', async () => {
      const updatedUsuario = { ...mockUsuario, nombre: 'Updated' };
      mockUsuarioUpdater.aplicarActualizaciones.mockResolvedValue(
        updatedUsuario,
      );
      mockUsuariosRepository.updateUsuario.mockResolvedValue(updatedUsuario); // Repo devuelve el actualizado
      mockUsuariosMappers.toResponseDto.mockReturnValue({
        ...mockRespuestaUsuarioDto,
        nombre: 'Updated',
      });

      const result = await service.update(1, mockUpdateDto);

      expect(updater.aplicarActualizaciones).toHaveBeenCalledWith(
        1,
        mockUpdateDto,
      );
      expect(repository.updateUsuario).toHaveBeenCalledWith(updatedUsuario);
      expect(mapper.toResponseDto).toHaveBeenCalledWith(updatedUsuario);
      expect(result.nombre).toBe('Updated');
    });
    it('debería propagar error si updater falla', async () => {
      const error = new BadRequestException('Email inválido');
      mockUsuarioUpdater.aplicarActualizaciones.mockRejectedValue(error);
      await expect(service.update(1, mockUpdateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.updateUsuario).not.toHaveBeenCalled();
      expect(mapper.toResponseDto).not.toHaveBeenCalled();
    });
    it('debería propagar error si repository falla', async () => {
      const error = new InternalServerErrorException('DB Error');
      const updatedUsuario = { ...mockUsuario, nombre: 'Updated' };
      mockUsuarioUpdater.aplicarActualizaciones.mockResolvedValue(
        updatedUsuario,
      ); // Updater OK
      mockUsuariosRepository.updateUsuario.mockRejectedValue(error); // Repo falla
      await expect(service.update(1, mockUpdateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mapper.toResponseDto).not.toHaveBeenCalled();
    });
  });
  // ... delete ...
  describe('delete', () => {
    it('debería validar usuario y llamar a repo delete', async () => {
      mockUsuariosValidator.validateUsuarioExistente.mockResolvedValue(
        mockUsuario,
      );
      mockUsuariosRepository.delete.mockResolvedValue(undefined);

      await service.delete(1);

      expect(validator.validateUsuarioExistente).toHaveBeenCalledWith(1);
      expect(repository.delete).toHaveBeenCalledWith(mockUsuario);
    });
    it('debería fallar si validateUsuarioExistente falla', async () => {
      const error = new NotFoundException('No existe');
      mockUsuariosValidator.validateUsuarioExistente.mockRejectedValue(error);
      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });
    it('debería propagar error si repository.delete falla', async () => {
      const error = new Error('DB Error');
      mockUsuariosValidator.validateUsuarioExistente.mockResolvedValue(
        mockUsuario,
      ); // Valida OK
      mockUsuariosRepository.delete.mockRejectedValue(error); // Repo falla
      await expect(service.delete(1)).rejects.toThrow(error);
    });
  });
  // ... findByEmail ...
  describe('findByEmail', () => {
    it('debería encontrar usuario por email', async () => {
      mockUsuariosRepository.findByEmail.mockResolvedValue(mockUsuario);
      const result = await service.findByEmail('test@test.com');
      expect(repository.findByEmail).toHaveBeenCalledWith('test@test.com');
      expect(result).toEqual(mockUsuario);
    });
    it('debería devolver null si no lo encuentra', async () => {
      mockUsuariosRepository.findByEmail.mockResolvedValue(null);
      const result = await service.findByEmail('notfound@test.com');
      expect(repository.findByEmail).toHaveBeenCalledWith('notfound@test.com');
      expect(result).toBeNull();
    });
    it('debería propagar error si repository.findByEmail falla', async () => {
      const error = new Error('DB Error');
      mockUsuariosRepository.findByEmail.mockRejectedValue(error);
      await expect(service.findByEmail('test@test.com')).rejects.toThrow(error);
    });
  });
  // ... forgotPassword ...
  describe('forgotPassword', () => {
    const email = 'test@test.com';
    const frontendUrl = 'http://localhost:4200';
    const resetUrl = `${frontendUrl}/reset-password?token=mock_token`;

    beforeEach(() => {
      mockConfigService.get.mockReturnValue(frontendUrl); // Mockear URL frontend
    });

    it('debería generar token, guardar, enviar email y registrar historial éxito', async () => {
      mockUsuariosRepository.findByEmail.mockResolvedValue(mockUsuario);
      // El mock interno toString ya está configurado en mockRandomBytesFn
      mockUsuariosRepository.guardarTokenReset.mockResolvedValue(undefined);
      mockMailService.sendPasswordReset.mockResolvedValue(undefined);
      mockHistorialService.create.mockResolvedValue({});

      await service.forgotPassword(email);

      expect(repository.findByEmail).toHaveBeenCalledWith(email);
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(repository.guardarTokenReset).toHaveBeenCalledWith(
        email,
        'mock_token',
        expect.any(Date),
      );
      expect(configService.get).toHaveBeenCalledWith('FRONTEND_URL');
      expect(mailService.sendPasswordReset).toHaveBeenCalledWith(
        email,
        mockUsuario.nombre,
        resetUrl,
      );
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 5,
        estadoId: 1,
      }); // Éxito
    });
    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockUsuariosRepository.findByEmail.mockResolvedValue(null);
      await expect(service.forgotPassword(email)).rejects.toThrow(
        NotFoundException,
      );
      expect(crypto.randomBytes).not.toHaveBeenCalled();
      expect(repository.guardarTokenReset).not.toHaveBeenCalled();
      expect(mailService.sendPasswordReset).not.toHaveBeenCalled();
      expect(historial.create).not.toHaveBeenCalled();
    });
    it('debería fallar, registrar historial fallo y lanzar InternalServerErrorException si guardarTokenReset falla', async () => {
      const dbError = new Error('DB Save Error');
      mockUsuariosRepository.findByEmail.mockResolvedValue(mockUsuario);
      // El mock interno toString ya está configurado
      mockUsuariosRepository.guardarTokenReset.mockRejectedValue(dbError); // Repo falla
      mockHistorialService.create.mockResolvedValue({});

      await expect(service.forgotPassword(email)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 5,
        estadoId: 2,
      }); // Fallo
      expect(mailService.sendPasswordReset).not.toHaveBeenCalled(); // No debe enviar email
    });
    it('debería fallar, registrar historial fallo y lanzar InternalServerErrorException si mailService falla', async () => {
      const mailError = new Error('Mail Send Error');
      mockUsuariosRepository.findByEmail.mockResolvedValue(mockUsuario);
      // El mock interno toString ya está configurado
      mockUsuariosRepository.guardarTokenReset.mockResolvedValue(undefined); // Guarda OK
      mockConfigService.get.mockReturnValue(frontendUrl);
      mockMailService.sendPasswordReset.mockRejectedValue(mailError); // Mail falla
      mockHistorialService.create.mockResolvedValue({});

      await expect(service.forgotPassword(email)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mailService.sendPasswordReset).toHaveBeenCalled(); // Se intentó enviar
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 5,
        estadoId: 2,
      }); // Fallo
    });
  });
  // ... resetPassword ...
  describe('resetPassword', () => {
    it('debería resetear password si el token es válido y no expirado', async () => {
      mockUsuariosRepository.findOneByResetToken.mockResolvedValue(
        mockUsuarioWithToken,
      );
      mockGenSalt.mockResolvedValue('salt');
      mockHash.mockResolvedValue('new_hashed_password');
      mockUsuariosRepository.updatePassword.mockResolvedValue(undefined);

      await service.resetPassword('valid_token', 'newPassword123');

      expect(repository.findOneByResetToken).toHaveBeenCalledWith(
        'valid_token',
      );
      expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 'salt');
      expect(repository.updatePassword).toHaveBeenCalledWith(
        mockUsuarioWithToken.id,
        'new_hashed_password',
      );
    });
    it('debería lanzar BadRequestException si el usuario no se encuentra por token', async () => {
      mockUsuariosRepository.findOneByResetToken.mockResolvedValue(null);
      await expect(
        service.resetPassword('invalid_token', 'newPass'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.resetPassword('invalid_token', 'newPass'),
      ).rejects.toThrow('Usuario no encontrado');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(repository.updatePassword).not.toHaveBeenCalled();
    });
    it('debería lanzar BadRequestException si el token ha expirado', async () => {
      mockUsuariosRepository.findOneByResetToken.mockResolvedValue(
        mockUsuarioWithExpiredToken,
      );
      await expect(
        service.resetPassword('expired_token', 'newPass'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.resetPassword('expired_token', 'newPass'),
      ).rejects.toThrow('Token inválido o expirado');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(repository.updatePassword).not.toHaveBeenCalled();
    });
    it('debería lanzar BadRequestException si la fecha de expiración es null', async () => {
      const userWithNullExp = {
        ...mockUsuarioWithToken,
        passwordResetExpiration: null,
      };
      mockUsuariosRepository.findOneByResetToken.mockResolvedValue(
        userWithNullExp,
      );
      await expect(
        service.resetPassword('valid_token_null_exp', 'newPass'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.resetPassword('valid_token_null_exp', 'newPass'),
      ).rejects.toThrow('Token inválido o expirado');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(repository.updatePassword).not.toHaveBeenCalled();
    });
    it('debería propagar error si repository.updatePassword falla', async () => {
      const error = new InternalServerErrorException('DB Error');
      mockUsuariosRepository.findOneByResetToken.mockResolvedValue(
        mockUsuarioWithToken,
      ); // Token válido
      mockGenSalt.mockResolvedValue('salt');
      mockHash.mockResolvedValue('new_hashed_password');
      mockUsuariosRepository.updatePassword.mockRejectedValue(error); // Repo falla

      await expect(
        service.resetPassword('valid_token', 'newPass'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
