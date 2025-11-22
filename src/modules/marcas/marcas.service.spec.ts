/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
// --- MOCKS DE MÓDULOS ---
// 1. Mockear Swagger (¡ESENCIAL!)
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger,
  SwaggerModule: { createDocument: jest.fn(), setup: jest.fn() },
  DocumentBuilder: jest.fn(() => ({ build: jest.fn() })),
}));

// 2. Mockear fs/promises (¡ESENCIAL!)
const mockFsUnlink = jest.fn();
jest.mock('fs/promises', () => ({
  unlink: mockFsUnlink,
}));

// --- IMPORTS REALES ---
import { Test, TestingModule } from '@nestjs/testing';
import { MarcasService } from './marcas.service';
import { IMarcaRepository } from './repositories/marca-repository.interface';
import { MarcaMapper } from './mapper/marca.mapper';
import { MarcaValidator } from './helpers/marcas-validator';
import { MarcasUpdater } from './helpers/marcas-updater';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException, // Import NotFoundException
} from '@nestjs/common';
import { Marca } from './entities/marca.entity';
import { Linea } from '../lineas/entities/linea.entity'; // Import Linea
import { Usuario } from '../usuario/entities/usuario.entity'; // Import Usuario
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { MarcaResponseDto } from './dto/marca-response.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateResult } from 'typeorm';

// --- MOCK DATA ---
const mockUsuario: Usuario = { id: 1 } as Usuario;
const mockLinea: Linea = { id: 8, nombre: 'Escolar' } as Linea;
const mockLineas: Linea[] = [mockLinea];

const mockMarca: Marca = {
  id: 1,
  nombre: 'Marca Test',
  descripcion: 'Desc Test',
  logo: 'logo-existente.png',
  deletedAt: null,
  lineas: mockLineas, // Incluir líneas
} as Marca;

const mockMarcaSinLogo: Marca = { ...mockMarca, logo: null };

const mockMarcaResponseDto: MarcaResponseDto = {
  id: 1,
  nombre: 'Marca Test',
  descripcion: 'Desc Test',
  logoUrl: 'http://localhost:3000/uploads/logos/logo-existente.png',
};

const mockCreateDto: CreateMarcaDto = {
  nombre: 'Nueva Marca',
  descripcion: 'Nueva Desc',
  logo: 'nuevo-logo.png', // Logo viene del controller
  lineasId: [8],
};

const mockUpdateDto: UpdateMarcaDto = {
  nombre: 'Marca Actualizada',
  lineasId: [9], // Nueva línea
};

// --- MOCK PROVIDERS ---
const mockMarcaRepository = {
  create: jest.fn(),
  findAllPaginated: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findOneWithDeleted: jest.fn(), // Necesario para restore (aunque no esté en service)
  findByNombre: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockMarcaMapper = {
  toResponseDto: jest.fn(),
  toResponseDtoList: jest.fn(),
  toRespuestaFindAllPaginatedMarcasDTO: jest.fn(),
};

const mockMarcaValidator = {
  validateNombreUnico: jest.fn(),
  validateLineasExistentes: jest.fn(),
  validateExistencia: jest.fn(),
};

const mockMarcasUpdater = {
  updateMarca: jest.fn(),
};

const mockHistorialService = {
  create: jest.fn(),
};

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// --- TEST SUITE ---
describe('MarcasService', () => {
  let service: MarcasService;
  let repository: IMarcaRepository;
  let mapper: MarcaMapper;
  let validator: MarcaValidator;
  let updater: MarcasUpdater;
  let historial: HistorialActividadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarcasService,
        { provide: 'IMarcaRepository', useValue: mockMarcaRepository },
        { provide: MarcaMapper, useValue: mockMarcaMapper },
        { provide: MarcaValidator, useValue: mockMarcaValidator },
        { provide: MarcasUpdater, useValue: mockMarcasUpdater },
        {
          provide: HistorialActividadesService,
          useValue: mockHistorialService,
        },
        // Logger ya no se provee aquí
      ],
    }).compile();

    service = module.get<MarcasService>(MarcasService);
    repository = module.get<IMarcaRepository>('IMarcaRepository');
    mapper = module.get<MarcaMapper>(MarcaMapper);
    validator = module.get<MarcaValidator>(MarcaValidator);
    updater = module.get<MarcasUpdater>(MarcasUpdater);
    historial = module.get<HistorialActividadesService>(
      HistorialActividadesService,
    );

    // Sobrescribimos el logger interno
    (service as any).logger = mockLogger;
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockFsUnlink.mockClear();
    Object.values(mockLogger).forEach((mockFn) => mockFn.mockClear());
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // Pruebas para create()
  describe('create', () => {
    it('debería validar, crear, registrar historial y mapear', async () => {
      mockMarcaValidator.validateNombreUnico.mockResolvedValue(undefined);
      mockMarcaValidator.validateLineasExistentes.mockResolvedValue(mockLineas);
      mockMarcaRepository.create.mockResolvedValue(mockMarca);
      mockHistorialService.create.mockResolvedValue({});
      mockMarcaMapper.toResponseDto.mockReturnValue(mockMarcaResponseDto);

      const result = await service.create(mockCreateDto, mockUsuario);

      expect(validator.validateNombreUnico).toHaveBeenCalledWith(
        mockCreateDto.nombre,
      );
      expect(validator.validateLineasExistentes).toHaveBeenCalledWith(
        mockCreateDto.lineasId,
      );
      expect(repository.create).toHaveBeenCalledWith(mockCreateDto, mockLineas);
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 10,
        estadoId: 1, // Exitoso
      });
      expect(mapper.toResponseDto).toHaveBeenCalledWith(mockMarca);
      expect(result).toEqual(mockMarcaResponseDto);
    });

    it('debería fallar validación nombre, registrar historial fallo', async () => {
      const error = new BadRequestException('Nombre ya existe');
      mockMarcaValidator.validateNombreUnico.mockRejectedValue(error);
      mockHistorialService.create.mockResolvedValue({});

      await expect(service.create(mockCreateDto, mockUsuario)).rejects.toThrow(
        BadRequestException,
      );

      expect(validator.validateNombreUnico).toHaveBeenCalledWith(
        mockCreateDto.nombre,
      );
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 10,
        estadoId: 2, // Fallido
      });
      expect(validator.validateLineasExistentes).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('debería fallar validación líneas, registrar historial fallo', async () => {
      const error = new NotFoundException('Línea no encontrada');
      mockMarcaValidator.validateNombreUnico.mockResolvedValue(undefined);
      mockMarcaValidator.validateLineasExistentes.mockRejectedValue(error);
      mockHistorialService.create.mockResolvedValue({});

      await expect(service.create(mockCreateDto, mockUsuario)).rejects.toThrow(
        NotFoundException,
      );

      expect(validator.validateNombreUnico).toHaveBeenCalled();
      expect(validator.validateLineasExistentes).toHaveBeenCalledWith(
        mockCreateDto.lineasId,
      );
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 10,
        estadoId: 2, // Fallido
      });
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('debería fallar repository create, registrar historial fallo', async () => {
      const error = new InternalServerErrorException('DB error');
      mockMarcaValidator.validateNombreUnico.mockResolvedValue(undefined);
      mockMarcaValidator.validateLineasExistentes.mockResolvedValue(mockLineas);
      mockMarcaRepository.create.mockRejectedValue(error);
      mockHistorialService.create.mockResolvedValue({});

      await expect(service.create(mockCreateDto, mockUsuario)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(repository.create).toHaveBeenCalledWith(mockCreateDto, mockLineas);
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 10,
        estadoId: 2, // Fallido
      });
      expect(mapper.toResponseDto).not.toHaveBeenCalled();
    });
  });

  // Pruebas para findAllPaginated()
  describe('findAllPaginated', () => {
    it('debería obtener y mapear marcas paginadas', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const repoResult = {
        marcas: [mockMarca],
        total: 1,
        page: 1,
        lastPage: 1,
      };
      const mappedResult = {
        marcas: [mockMarcaResponseDto],
        total: 1,
        page: 1,
        lastPage: 1,
      };
      mockMarcaRepository.findAllPaginated.mockResolvedValue(repoResult);
      mockMarcaMapper.toRespuestaFindAllPaginatedMarcasDTO.mockReturnValue(
        mappedResult,
      );

      const result = await service.findAllPaginated(paginationDto);

      expect(repository.findAllPaginated).toHaveBeenCalledWith(paginationDto);
      expect(mapper.toRespuestaFindAllPaginatedMarcasDTO).toHaveBeenCalledWith(
        repoResult,
      );
      expect(result).toEqual(mappedResult);
    });
    it('should propagate error if repository findAllPaginated fails', async () => {
      const dbError = new Error('DB Error');
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      mockMarcaRepository.findAllPaginated.mockRejectedValue(dbError);

      await expect(service.findAllPaginated(paginationDto)).rejects.toThrow(
        dbError,
      );
      expect(
        mapper.toRespuestaFindAllPaginatedMarcasDTO,
      ).not.toHaveBeenCalled();
    });
  });

  // Pruebas para findAll()
  describe('findAll', () => {
    it('debería obtener y mapear todas las marcas', async () => {
      const repoResult = [mockMarca];
      const mappedResult = [mockMarcaResponseDto];
      mockMarcaRepository.findAll.mockResolvedValue(repoResult);
      mockMarcaMapper.toResponseDtoList.mockReturnValue(mappedResult);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(mapper.toResponseDtoList).toHaveBeenCalledWith(repoResult);
      expect(result).toEqual(mappedResult);
    });
    it('should propagate error if repository findAll fails', async () => {
      const dbError = new Error('DB Error');
      mockMarcaRepository.findAll.mockRejectedValue(dbError);

      await expect(service.findAll()).rejects.toThrow(dbError);
      expect(mapper.toResponseDtoList).not.toHaveBeenCalled();
    });
  });

  // Pruebas para findOne()
  describe('findOne', () => {
    it('debería encontrar y mapear una marca', async () => {
      mockMarcaRepository.findOne.mockResolvedValue(mockMarca);
      mockMarcaMapper.toResponseDto.mockReturnValue(mockMarcaResponseDto);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(mapper.toResponseDto).toHaveBeenCalledWith(mockMarca);
      expect(result).toEqual(mockMarcaResponseDto);
    });

    it('debería lanzar BadRequestException si no la encuentra', async () => {
      mockMarcaRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(BadRequestException);
      expect(mapper.toResponseDto).not.toHaveBeenCalled();
    });

    it('should propagate error if repository findOne fails', async () => {
      const dbError = new Error('DB Error');
      mockMarcaRepository.findOne.mockRejectedValue(dbError);

      await expect(service.findOne(1)).rejects.toThrow(dbError);
      expect(mapper.toResponseDto).not.toHaveBeenCalled();
    });
  });

  // Pruebas para findOneForServices()
  describe('findOneForServices', () => {
    it('debería encontrar y devolver una marca (entidad)', async () => {
      mockMarcaRepository.findOne.mockResolvedValue(mockMarca);
      const result = await service.findOneForServices(1);
      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMarca);
    });

    it('debería devolver null si no la encuentra', async () => {
      mockMarcaRepository.findOne.mockResolvedValue(null);
      const result = await service.findOneForServices(99);
      expect(repository.findOne).toHaveBeenCalledWith(99);
      expect(result).toBeNull();
    });

    it('should propagate error if repository findOne fails', async () => {
      const dbError = new Error('DB Error');
      mockMarcaRepository.findOne.mockRejectedValue(dbError);
      await expect(service.findOneForServices(1)).rejects.toThrow(dbError);
    });
  });

  // Pruebas para update()
  describe('update', () => {
    const marcaActualizada = { ...mockMarca, nombre: 'Marca Actualizada' }; // Resultado del updater
    const repoUpdateResult = { ...marcaActualizada }; // Resultado del repo.update
    const mappedResult = {
      ...mockMarcaResponseDto,
      nombre: 'Marca Actualizada',
    }; // Resultado final

    it('debería validar, actualizar via updater/repo y mapear', async () => {
      mockMarcaValidator.validateExistencia.mockResolvedValue(mockMarca);
      mockMarcasUpdater.updateMarca.mockResolvedValue(marcaActualizada);
      mockMarcaRepository.update.mockResolvedValue(repoUpdateResult);
      mockMarcaMapper.toResponseDto.mockReturnValue(mappedResult);

      const result = await service.update(1, mockUpdateDto, mockUsuario);

      expect(validator.validateExistencia).toHaveBeenCalledWith(1);
      expect(updater.updateMarca).toHaveBeenCalledWith(
        mockMarca,
        mockUpdateDto,
      );
      expect(repository.update).toHaveBeenCalledWith(marcaActualizada);
      expect(mapper.toResponseDto).toHaveBeenCalledWith(repoUpdateResult);
      expect(result).toEqual(mappedResult);
      // No esperamos llamadas a historial aquí según el código provisto
      expect(historial.create).not.toHaveBeenCalled();
    });

    it('debería fallar si validateExistencia falla', async () => {
      const error = new NotFoundException('No existe');
      mockMarcaValidator.validateExistencia.mockRejectedValue(error);

      await expect(
        service.update(99, mockUpdateDto, mockUsuario),
      ).rejects.toThrow(NotFoundException);
      expect(updater.updateMarca).not.toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
      expect(historial.create).not.toHaveBeenCalled();
    });

    it('debería fallar si updater.updateMarca falla', async () => {
      const error = new BadRequestException('Validación falló en updater');
      mockMarcaValidator.validateExistencia.mockResolvedValue(mockMarca);
      mockMarcasUpdater.updateMarca.mockRejectedValue(error);

      await expect(
        service.update(1, mockUpdateDto, mockUsuario),
      ).rejects.toThrow(BadRequestException);
      expect(repository.update).not.toHaveBeenCalled();
      expect(historial.create).not.toHaveBeenCalled();
    });

    it('debería fallar si repository.update falla', async () => {
      const error = new InternalServerErrorException('DB Error');
      mockMarcaValidator.validateExistencia.mockResolvedValue(mockMarca);
      mockMarcasUpdater.updateMarca.mockResolvedValue(marcaActualizada);
      mockMarcaRepository.update.mockRejectedValue(error); // Repo falla

      await expect(
        service.update(1, mockUpdateDto, mockUsuario),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mapper.toResponseDto).not.toHaveBeenCalled();
      expect(historial.create).not.toHaveBeenCalled();
    });
  });

  // Pruebas para remove()
  describe('remove', () => {
    it('debería validar, eliminar (sin logo), registrar historial', async () => {
      mockMarcaValidator.validateExistencia.mockResolvedValue(mockMarcaSinLogo);
      mockMarcaRepository.remove.mockResolvedValue({} as UpdateResult);
      mockHistorialService.create.mockResolvedValue({});

      await service.remove(1, mockUsuario);

      expect(validator.validateExistencia).toHaveBeenCalledWith(1);
      expect(repository.remove).toHaveBeenCalledWith(1);
      expect(mockFsUnlink).not.toHaveBeenCalled(); // Sin logo
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 12,
        estadoId: 1, // Exitoso
      });
    });

    it('debería validar, eliminar (con logo), eliminar archivo, registrar historial', async () => {
      mockMarcaValidator.validateExistencia.mockResolvedValue(mockMarca); // Con logo
      mockMarcaRepository.remove.mockResolvedValue({} as UpdateResult);
      mockFsUnlink.mockResolvedValue(undefined); // Unlink exitoso
      mockHistorialService.create.mockResolvedValue({});

      await service.remove(1, mockUsuario);

      expect(validator.validateExistencia).toHaveBeenCalledWith(1);
      expect(repository.remove).toHaveBeenCalledWith(1);
      expect(mockFsUnlink).toHaveBeenCalledTimes(1);
      expect(mockFsUnlink).toHaveBeenCalledWith(
        expect.stringContaining(mockMarca.logo),
      );
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 12,
        estadoId: 1, // Exitoso
      });
      expect(mockLogger.error).not.toHaveBeenCalled(); // No debe loggear error
    });

    it('debería validar, eliminar (con logo), fallar unlink, loggear error, registrar historial éxito', async () => {
      const fsError = new Error('Permiso denegado');
      mockMarcaValidator.validateExistencia.mockResolvedValue(mockMarca);
      mockMarcaRepository.remove.mockResolvedValue({} as UpdateResult);
      mockFsUnlink.mockRejectedValue(fsError); // Unlink falla
      mockHistorialService.create.mockResolvedValue({});

      await service.remove(1, mockUsuario); // NO debe lanzar error

      expect(validator.validateExistencia).toHaveBeenCalledWith(1);
      expect(repository.remove).toHaveBeenCalledWith(1);
      expect(mockFsUnlink).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        // Verifica log de error
        expect.stringContaining(
          'No se pudo eliminar el logo durante el soft delete:',
        ),
        fsError.stack,
      );
      expect(historial.create).toHaveBeenCalledWith({
        // Aún así registra éxito
        usuario: mockUsuario.id,
        accionId: 12,
        estadoId: 1, // Exitoso
      });
    });

    it('debería fallar validateExistencia, registrar historial fallo', async () => {
      const error = new NotFoundException('No existe');
      mockMarcaValidator.validateExistencia.mockRejectedValue(error);
      mockHistorialService.create.mockResolvedValue({});

      await expect(service.remove(99, mockUsuario)).rejects.toThrow(
        NotFoundException,
      );

      expect(repository.remove).not.toHaveBeenCalled();
      expect(mockFsUnlink).not.toHaveBeenCalled();
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 12,
        estadoId: 2, // Fallido
      });
    });

    it('debería fallar repository.remove, registrar historial fallo', async () => {
      const error = new InternalServerErrorException('DB Error');
      mockMarcaValidator.validateExistencia.mockResolvedValue(mockMarca);
      mockMarcaRepository.remove.mockRejectedValue(error); // Repo falla
      mockHistorialService.create.mockResolvedValue({});

      await expect(service.remove(1, mockUsuario)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockFsUnlink).not.toHaveBeenCalled(); // Falla antes del unlink
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 12,
        estadoId: 2, // Fallido
      });
    });
  });

  // Pruebas para findOneByNombre()
  describe('findOneByNombre', () => {
    it('debería encontrar y devolver una marca por nombre', async () => {
      mockMarcaRepository.findByNombre.mockResolvedValue(mockMarca);
      const result = await service.findOneByNombre('Marca Test');
      expect(repository.findByNombre).toHaveBeenCalledWith('Marca Test');
      expect(result).toEqual(mockMarca);
    });

    it('debería devolver null si no la encuentra por nombre', async () => {
      mockMarcaRepository.findByNombre.mockResolvedValue(null);
      const result = await service.findOneByNombre('Inexistente');
      expect(repository.findByNombre).toHaveBeenCalledWith('Inexistente');
      expect(result).toBeNull();
    });

    it('should propagate error if repository findByNombre fails', async () => {
      const dbError = new Error('DB Error');
      mockMarcaRepository.findByNombre.mockRejectedValue(dbError);
      await expect(service.findOneByNombre('Marca Test')).rejects.toThrow(
        dbError,
      );
    });
  });
});
