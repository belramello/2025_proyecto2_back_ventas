/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// --- MOCKS DE MÓDULOS ---
// 1. Mockear Swagger para evitar el crash de importación
// (Necesario porque CreatePermisoDto usa @ApiProperty)
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
import { PermisosService } from './permisos.service';
import { IPermisosRepository } from './repositories/permisos-repository.interface';
import { PermisosValidator } from './helpers/permisos-validator';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { Permiso } from './entities/permiso.entity';
import { NotFoundException } from '@nestjs/common';
import { Rol } from '../roles/entities/rol.entity';

// --- MOCK DATA ---
const mockPermiso: Permiso = {
  id: 1,
  nombre: 'CREAR_PRODUCTO',
  categoria: 'PRODUCTOS',
  roles: [],
};

const mockCreateDto: CreatePermisoDto = {
  nombre: 'CREAR_PRODUCTO',
  categoria: 'PRODUCTOS',
};

// Mockeamos un Rol para la validación
const mockRol: Rol = {
  id: 1,
  nombre: 'Admin',
  descripcion: '...',
  permisos: [],
  usuarios: [],
};

// --- MOCK PROVIDERS ---
const mockPermisosRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllByRol: jest.fn(),
  findOne: jest.fn(),
};

const mockPermisosValidator = {
  validateRolExistente: jest.fn(),
};

// --- TEST SUITE ---
describe('PermisosService', () => {
  let service: PermisosService;
  let repository: IPermisosRepository;
  let validator: PermisosValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermisosService,
        {
          provide: 'IPermisosRepository', // Usamos el token de inyección
          useValue: mockPermisosRepository,
        },
        {
          provide: PermisosValidator,
          useValue: mockPermisosValidator,
        },
      ],
    }).compile();

    service = module.get<PermisosService>(PermisosService);
    repository = module.get<IPermisosRepository>('IPermisosRepository');
    validator = module.get<PermisosValidator>(PermisosValidator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // Pruebas para el método create()
  describe('create', () => {
    it('debería crear un permiso llamando al repositorio', async () => {
      mockPermisosRepository.create.mockResolvedValue(mockPermiso);

      const result = await service.create(mockCreateDto);

      expect(mockPermisosRepository.create).toHaveBeenCalledTimes(1);
      expect(mockPermisosRepository.create).toHaveBeenCalledWith(mockCreateDto);
      expect(result).toEqual(mockPermiso);
    });
  });

  // Pruebas para el método findAll()
  describe('findAll', () => {
    it('debería retornar un array de permisos', async () => {
      const permisosArray = [mockPermiso];
      mockPermisosRepository.findAll.mockResolvedValue(permisosArray);

      const result = await service.findAll();

      expect(mockPermisosRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(permisosArray);
    });
  });

  // Pruebas para el método findOne()
  describe('findOne', () => {
    it('debería retornar un permiso por ID', async () => {
      mockPermisosRepository.findOne.mockResolvedValue(mockPermiso);

      const result = await service.findOne(1);

      expect(mockPermisosRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockPermisosRepository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPermiso);
    });

    it('debería retornar null si el permiso no se encuentra', async () => {
      mockPermisosRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(99);

      expect(mockPermisosRepository.findOne).toHaveBeenCalledWith(99);
      expect(result).toBeNull();
    });
  });

  // Pruebas para el método findAllByRol()
  describe('findAllByRol', () => {
    const rolId = 1;

    it('debería validar el rol y retornar los permisos asociados', async () => {
      const permisosArray = [mockPermiso];
      mockPermisosValidator.validateRolExistente.mockResolvedValue(mockRol);
      mockPermisosRepository.findAllByRol.mockResolvedValue(permisosArray);

      const result = await service.findAllByRol(rolId);

      expect(mockPermisosValidator.validateRolExistente).toHaveBeenCalledTimes(
        1,
      );
      expect(mockPermisosValidator.validateRolExistente).toHaveBeenCalledWith(
        rolId,
      );
      expect(mockPermisosRepository.findAllByRol).toHaveBeenCalledTimes(1);
      expect(mockPermisosRepository.findAllByRol).toHaveBeenCalledWith(rolId);
      expect(result).toEqual(permisosArray);
    });

    it('debería lanzar NotFoundException si el validador falla', async () => {
      const rolIdInexistente = 99;
      const error = new NotFoundException('Rol no encontrado');
      mockPermisosValidator.validateRolExistente.mockRejectedValue(error);

      await expect(service.findAllByRol(rolIdInexistente)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPermisosValidator.validateRolExistente).toHaveBeenCalledWith(
        rolIdInexistente,
      );
      // Verificamos que no se llamó al repositorio si la validación falló
      expect(mockPermisosRepository.findAllByRol).not.toHaveBeenCalled();
    });
  });
});
