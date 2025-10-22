import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { UpdatePermisosRolDto } from './dto/update-permisos-rol.dto';
import { RespuestaFindOneRolesDto } from './dto/respuesta-find-one-roles.dto';
import { Rol } from './entities/rol.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '../../middlewares/auth.middleware';
import { PermisosGuard } from '../../common/guards/permisos.guard';

// --- Mocks y Datos de Prueba ---

// 1. Datos falsos (stubs)
const mockRespuestaRolDto: RespuestaFindOneRolesDto = {
  id: 1,
  nombre: 'Admin',
  descripcion: 'Rol de admin',
  modificable: true,
  permisos: [],
};

const mockRol: Rol = {
  id: 1,
  nombre: 'Admin',
  descripcion: 'Rol de admin',
  modificable: true,
  permisos: [],
  usuarios: [],
};

// 2. Tipo para el mock del servicio
type MockRolesService = Partial<Record<keyof RolesService, jest.Mock>>;

// 3. Fábrica de Mocks
const createMockRolesService = (): MockRolesService => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  updatePermisos: jest.fn(),
});

// --- Suite de Pruebas ---

describe('RolesController', () => {
  let controller: RolesController;
  let service: MockRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // 1. El controlador real
      controllers: [RolesController],
      // 2. El mock de su dependencia (RolesService)
      providers: [
        {
          provide: RolesService,
          useValue: createMockRolesService(),
        },
      ],
    })
      // 3. Omitimos los Guards para la prueba unitaria
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermisosGuard)
      .useValue({ canActivate: () => true })
      .compile();

    // 4. Inyectamos el controlador y el servicio mockeado
    controller = module.get<RolesController>(RolesController);
    service = module.get<MockRolesService>(RolesService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  // --- Pruebas para findAll() ---
  describe('findAll', () => {
    it('debería retornar un array de RespuestaFindOneRolesDto', async () => {
      const mockResult = [mockRespuestaRolDto];
      service.findAll?.mockResolvedValue(mockResult);

      const result = await controller.findAll();

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('debería retornar un array vacío si no hay roles', async () => {
      service.findAll?.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  // --- Pruebas para findOne() ---
  describe('findOne', () => {
    it('debería retornar un Rol si lo encuentra', async () => {
      const rolId = 1;
      service.findOne?.mockResolvedValue(mockRol);

      const result = await controller.findOne(rolId);

      expect(result).toEqual(mockRol);
      expect(service.findOne).toHaveBeenCalledWith(rolId);
    });

    it('debería lanzar NotFoundException si el servicio la lanza', async () => {
      const rolId = 99;
      service.findOne?.mockRejectedValue(
        new NotFoundException('Rol no encontrado'),
      );

      // Verificamos que el controlador propaga la excepción
      await expect(controller.findOne(rolId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith(rolId);
    });
  });

  // --- Pruebas para updatePermisos() ---
  describe('updatePermisos', () => {
    const rolId = 1;
    const updateDto: UpdatePermisosRolDto = { permisosId: [1, 2] };

    it('debería actualizar los permisos y no retornar nada (void)', async () => {
      // El servicio retorna Promise<void>
      service.updatePermisos?.mockResolvedValue(undefined);

      const result = await controller.updatePermisos(rolId, updateDto);

      expect(result).toBeUndefined();
      expect(service.updatePermisos).toHaveBeenCalledWith(rolId, updateDto);
    });

    it('debería lanzar NotFoundException si el servicio la lanza (rol no encontrado)', async () => {
      service.updatePermisos?.mockRejectedValue(
        new NotFoundException('Rol no encontrado'),
      );

      await expect(controller.updatePermisos(rolId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.updatePermisos).toHaveBeenCalledWith(rolId, updateDto);
    });

    it('debería lanzar ForbiddenException si el servicio la lanza (rol no modificable)', async () => {
      service.updatePermisos?.mockRejectedValue(
        new ForbiddenException('Rol no modificable'),
      );

      await expect(controller.updatePermisos(rolId, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(service.updatePermisos).toHaveBeenCalledWith(rolId, updateDto);
    });
  });
});
