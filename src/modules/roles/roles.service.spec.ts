import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { IRolesRepository } from './repositories/roles-repository.interface';
import { RolesValidator } from './helpers/roles-validator';
import { RolesMapper } from './mappers/roles-mapper';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdatePermisosRolDto } from './dto/update-permisos-rol.dto';
import { Rol } from './entities/rol.entity';
import { Permiso } from '../../modules/permisos/entities/permiso.entity';
import { RespuestaFindOneRolesDto } from './dto/respuesta-find-one-roles.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

// --- Mocks y Datos de Prueba ---

// 1. Creamos datos falsos (stubs) que usaremos en las pruebas
const mockPermiso: Permiso = { id: 1, nombre: 'ver_dashboard' } as Permiso;
const mockRol: Rol = {
  id: 1,
  nombre: 'Admin',
  descripcion: 'Rol de administrador',
  modificable: true,
  permisos: [mockPermiso],
  usuarios: [],
};

const mockRolNoModificable: Rol = {
  id: 2,
  nombre: 'Dueño',
  descripcion: 'Rol de dueño',
  modificable: false,
  permisos: [mockPermiso],
  usuarios: [],
};

// 2. Creamos tipos para nuestros mocks para tener autocompletado
// Usamos Partial<Record<...>> para mockear solo las funciones que usamos
type MockRepository = Partial<Record<keyof IRolesRepository, jest.Mock>>;
type MockValidator = Partial<Record<keyof RolesValidator, jest.Mock>>;
type MockMapper = Partial<Record<keyof RolesMapper, jest.Mock>>;

// 3. Creamos funciones "fábrica" para generar mocks frescos en cada test
const createMockRepository = (): MockRepository => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  updatePermisos: jest.fn(),
});

const createMockValidator = (): MockValidator => ({
  validatePermisosExistentes: jest.fn(),
  validateRolExistente: jest.fn(),
  validateRolModificable: jest.fn(),
});

const createMockMapper = (): MockMapper => ({
  toRespuestaFindOneRoles: jest.fn(),
  toRespuestaFindOne: jest.fn(),
});

// --- Suite de Pruebas ---

describe('RolesService', () => {
  let service: RolesService;
  let repository: MockRepository;
  let validator: MockValidator;
  let mapper: MockMapper;

  // El beforeEach del archivo que te pasé (EL CORRECTO)
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // El servicio real que queremos probar
        RolesService,

        // Y los MOCKS de TODAS sus dependencias
        {
          provide: 'IRolesRepository', // ¡Debe coincidir con tu @Inject('IRolesRepository')!
          useValue: createMockRepository(), // Mock para el repositorio
        },
        {
          provide: RolesValidator,
          useValue: createMockValidator(), // Mock para el validador
        },
        {
          provide: RolesMapper,
          useValue: createMockMapper(), // Mock para el mapper
        },
      ],
    }).compile();

    // Inyectamos el servicio y sus dependencias mockeadas
    service = module.get<RolesService>(RolesService);
    repository = module.get<MockRepository>('IRolesRepository');
    validator = module.get<MockValidator>(RolesValidator);
    mapper = module.get<MockMapper>(RolesMapper);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // --- Pruebas para el método create() ---
  describe('create', () => {
    it('debería crear un rol exitosamente', async () => {
      const createRolDto: CreateRolDto = {
        nombre: 'Admin',
        descripcion: 'Rol de admin',
        modificable: true,
        permisosId: [1],
      };
      const permisosMock = [mockPermiso];
      const rolCreado = mockRol;

      // Configuramos los mocks
      validator.validatePermisosExistentes.mockResolvedValue(permisosMock);
      repository.create.mockResolvedValue(rolCreado);

      // Ejecutamos el método
      const result = await service.create(createRolDto);

      // Verificamos
      expect(validator.validatePermisosExistentes).toHaveBeenCalledWith(
        createRolDto.permisosId,
      );
      expect(repository.create).toHaveBeenCalledWith(createRolDto, permisosMock);
      expect(result).toEqual(rolCreado);
    });

    it('debería lanzar NotFoundException si un permiso no existe', async () => {
      const createRolDto: CreateRolDto = {
        nombre: 'Admin',
        descripcion: 'Rol de admin',
        modificable: true,
        permisosId: [99], // ID de permiso inexistente
      };

      // Configuramos el mock para que falle
      validator.validatePermisosExistentes.mockRejectedValue(
        new NotFoundException('Permiso con ID 99 no encontrado'),
      );

      // Verificamos que la promesa sea rechazada con la excepción correcta
      await expect(service.create(createRolDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(validator.validatePermisosExistentes).toHaveBeenCalledWith(
        createRolDto.permisosId,
      );
      // Verificamos que el repositorio NUNCA fue llamado si la validación falla
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  // --- Pruebas para el método findAll() ---
  describe('findAll', () => {
    it('debería retornar un array de roles mapeados', async () => {
      const rolesArray = [mockRol];
      const rolesDtoArray: RespuestaFindOneRolesDto[] = [
        { ...mockRol, permisos: [mockPermiso] }, // El mapper devolvería esto
      ];

      // Configuramos los mocks
      repository.findAll.mockResolvedValue(rolesArray);
      mapper.toRespuestaFindOneRoles.mockReturnValue(rolesDtoArray);

      // Ejecutamos
      const result = await service.findAll();

      // Verificamos
      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(mapper.toRespuestaFindOneRoles).toHaveBeenCalledWith(rolesArray);
      expect(result).toEqual(rolesDtoArray);
    });

    it('debería retornar un array vacío si no hay roles', async () => {
      // Configuramos los mocks
      repository.findAll.mockResolvedValue([]);
      mapper.toRespuestaFindOneRoles.mockReturnValue([]);

      // Ejecutamos
      const result = await service.findAll();

      // Verificamos
      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(mapper.toRespuestaFindOneRoles).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });
  });

  // --- Pruebas para el método findOne() ---
  describe('findOne', () => {
    it('debería retornar un rol si se encuentra', async () => {
      const rolId = 1;
      repository.findOne.mockResolvedValue(mockRol);

      const result = await service.findOne(rolId);

      expect(repository.findOne).toHaveBeenCalledWith(rolId);
      expect(result).toEqual(mockRol);
    });

    it('debería retornar null si el rol no se encuentra', async () => {
      const rolId = 99;
      repository.findOne.mockResolvedValue(null);

      const result = await service.findOne(rolId);

      expect(repository.findOne).toHaveBeenCalledWith(rolId);
      expect(result).toBeNull();
    });
  });

  // --- Pruebas para el método updatePermisos() ---
  describe('updatePermisos', () => {
    const rolId = 1;
    const updateDto: UpdatePermisosRolDto = { permisosId: [1] };
    const permisosMock = [mockPermiso];

    it('debería actualizar los permisos de un rol exitosamente', async () => {
      // Configuramos los mocks
      validator.validateRolExistente.mockResolvedValue(mockRol);
      validator.validateRolModificable.mockImplementation(() => {
        // No hace nada, pasa la validación
      });
      validator.validatePermisosExistentes.mockResolvedValue(permisosMock);
      repository.updatePermisos.mockResolvedValue(undefined); // Es un void

      // Ejecutamos
      await service.updatePermisos(rolId, updateDto);

      // Verificamos que todas las funciones fueron llamadas en orden
      expect(validator.validateRolExistente).toHaveBeenCalledWith(rolId);
      expect(validator.validateRolModificable).toHaveBeenCalledWith(mockRol);
      expect(validator.validatePermisosExistentes).toHaveBeenCalledWith(
        updateDto.permisosId,
      );
      expect(repository.updatePermisos).toHaveBeenCalledWith(
        mockRol,
        permisosMock,
      );
    });

    it('debería lanzar NotFoundException si el rol no existe', async () => {
      // Configuramos el mock
      validator.validateRolExistente.mockRejectedValue(
        new NotFoundException('Rol no encontrado'),
      );

      // Verificamos
      await expect(service.updatePermisos(rolId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(validator.validateRolExistente).toHaveBeenCalledWith(rolId);
      // Verificamos que no se intentó validar el rol ni actualizar permisos
      expect(validator.validateRolModificable).not.toHaveBeenCalled();
      expect(repository.updatePermisos).not.toHaveBeenCalled();
    });

    it('debería lanzar ForbiddenException si el rol no es modificable', async () => {
      // Configuramos los mocks
      validator.validateRolExistente.mockResolvedValue(mockRolNoModificable);
      validator.validateRolModificable.mockImplementation(() => {
        throw new ForbiddenException('Rol no modificable');
      });

      // Verificamos
      await expect(service.updatePermisos(rolId, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(validator.validateRolExistente).toHaveBeenCalledWith(rolId);
      expect(validator.validateRolModificable).toHaveBeenCalledWith(
        mockRolNoModificable,
      );
      // Verificamos que no se intentó validar permisos ni actualizar
      expect(validator.validatePermisosExistentes).not.toHaveBeenCalled();
      expect(repository.updatePermisos).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si un permiso no existe', async () => {
      // Configuramos los mocks
      validator.validateRolExistente.mockResolvedValue(mockRol);
      validator.validateRolModificable.mockImplementation(() => {});
      validator.validatePermisosExistentes.mockRejectedValue(
        new NotFoundException('Permiso no encontrado'),
      );

      // Verificamos
      await expect(service.updatePermisos(rolId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(validator.validateRolExistente).toHaveBeenCalledWith(rolId);
      expect(validator.validateRolModificable).toHaveBeenCalledWith(mockRol);
      expect(validator.validatePermisosExistentes).toHaveBeenCalledWith(
        updateDto.permisosId,
      );
      // Verificamos que no se intentó actualizar
      expect(repository.updatePermisos).not.toHaveBeenCalled();
    });
  });
});