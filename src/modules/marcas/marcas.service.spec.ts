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

const mockFsUnlink = jest.fn();
jest.mock('fs/promises', () => ({
  unlink: mockFsUnlink,
}));

// --- IMPORTS REALES ---
import { Test, TestingModule } from '@nestjs/testing';
import { MarcasService } from './marcas.service';
import { IMarcaRepository } from './repositories/marca-repository.interface';
import { MarcaMapper } from './mapper/marca.mapper';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger, 
} from '@nestjs/common';
import { Marca } from './entities/marca.entity';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { MarcaResponseDto } from './dto/marca-response.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateResult } from 'typeorm';

// --- MOCK DATA --- (sin cambios)
const mockMarca: Marca = {
  id: 1,
  nombre: 'Marca Test',
  descripcion: 'Desc Test',
  logo: 'logo-antiguo.png',
  deletedAt: null,
} as Marca;

const mockMarcaResponseDto: MarcaResponseDto = {
  id: 1,
  nombre: 'Marca Test',
  descripcion: 'Desc Test',
  logoUrl: 'http://localhost:3000/uploads/logos/logo-antiguo.png',
};

// --- MOCK PROVIDERS --- (sin cambios)
const mockMarcaRepository = {
  create: jest.fn(),
  findAllPaginated: jest.fn(),
  findOne: jest.fn(),
  findOneWithDeleted: jest.fn(),
  findByNombre: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  restore: jest.fn(),
};

const mockMarcaMapper = {
  toResponseDto: jest.fn(),
  toRespuestaFindAllPaginatedMarcasDTO: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarcasService,
        {
          provide: 'IMarcaRepository',
          useValue: mockMarcaRepository,
        },
        {
          provide: MarcaMapper,
          useValue: mockMarcaMapper,
        },
      ],
    }).compile();

    service = module.get<MarcasService>(MarcasService);
    repository = module.get<IMarcaRepository>('IMarcaRepository');
    mapper = module.get<MarcaMapper>(MarcaMapper);

    // Sobrescribimos la propiedad logger DESPUÉS de que el servicio se crea
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

  // ... create ...
  describe('create', () => {
    it('debería crear una marca y mapearla a DTO', async () => {
      const createDto: CreateMarcaDto = { nombre: 'Nueva' };
      mockMarcaRepository.create.mockResolvedValue(mockMarca);
      mockMarcaMapper.toResponseDto.mockReturnValue(mockMarcaResponseDto);

      const result = await service.create(createDto);

      expect(mockMarcaRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockMarcaMapper.toResponseDto).toHaveBeenCalledWith(mockMarca);
      expect(result).toEqual(mockMarcaResponseDto);
    });
  });
  // ... findAllPaginated ...
  describe('findAllPaginated', () => {
    it('debería retornar marcas paginadas y mapeadas', async () => {
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

      expect(mockMarcaRepository.findAllPaginated).toHaveBeenCalledWith(
        paginationDto,
      );
      expect(
        mockMarcaMapper.toRespuestaFindAllPaginatedMarcasDTO,
      ).toHaveBeenCalledWith(repoResult);
      expect(result).toEqual(mappedResult);
    });
  });
  // ... findOne ...
  describe('findOne', () => {
    it('debería encontrar una marca y mapearla a DTO', async () => {
      mockMarcaRepository.findOne.mockResolvedValue(mockMarca);
      mockMarcaMapper.toResponseDto.mockReturnValue(mockMarcaResponseDto);

      const result = await service.findOne(1);

      expect(mockMarcaRepository.findOne).toHaveBeenCalledWith(1);
      expect(mockMarcaMapper.toResponseDto).toHaveBeenCalledWith(mockMarca);
      expect(result).toEqual(mockMarcaResponseDto);
    });

    it('debería lanzar BadRequestException si la marca no se encuentra', async () => {
      mockMarcaRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(BadRequestException);
      expect(mockMarcaMapper.toResponseDto).not.toHaveBeenCalled();
    });
  });
  // ... update ...
  describe('update', () => {
    const updateDto: UpdateMarcaDto = {
      nombre: 'Nuevo Nombre',
      logo: 'logo-nuevo.png',
    };
    const marcaActualizada = { ...mockMarca, ...updateDto };

    it('debería lanzar BadRequestException si la marca a actualizar no existe', async () => {
      mockMarcaRepository.findOne.mockResolvedValue(null);

      await expect(service.update(99, updateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockFsUnlink).not.toHaveBeenCalled();
      expect(mockMarcaRepository.update).not.toHaveBeenCalled();
    });

    it('debería actualizar, eliminar logo antiguo y retornar DTO actualizado', async () => {
      mockMarcaRepository.findOne
        .mockResolvedValueOnce(mockMarca) // 1ra llamada (check existe)
        .mockResolvedValueOnce(marcaActualizada); // 2da llamada (get actualizada)
      mockFsUnlink.mockResolvedValue(undefined); // fs.unlink éxito
      mockMarcaRepository.update.mockResolvedValue({} as UpdateResult);
      mockMarcaMapper.toResponseDto.mockReturnValue({
        ...mockMarcaResponseDto,
        nombre: 'Nuevo Nombre',
        logoUrl: 'http://.../logo-nuevo.png',
      });

      const result = await service.update(1, updateDto);

      expect(mockMarcaRepository.findOne).toHaveBeenCalledWith(1);
      expect(mockFsUnlink).toHaveBeenCalledTimes(1);
      expect(mockFsUnlink).toHaveBeenCalledWith(
        expect.stringContaining(mockMarca.logo),
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('Logo anterior eliminado:'),
      );
      expect(mockMarcaRepository.update).toHaveBeenCalledWith(1, updateDto);
      expect(mockMarcaMapper.toResponseDto).toHaveBeenCalledWith(
        marcaActualizada,
      );
      expect(result).toEqual({
        ...mockMarcaResponseDto,
        nombre: 'Nuevo Nombre',
        logoUrl: 'http://.../logo-nuevo.png',
      });
    });

    it('debería actualizar sin eliminar logo si el logo no cambia', async () => {
      const dtoSinCambioLogo = { ...updateDto, logo: mockMarca.logo }; // Mismo logo
      const marcaActualizadaMismoLogo = { ...mockMarca, ...dtoSinCambioLogo };
      mockMarcaRepository.findOne
        .mockResolvedValueOnce(mockMarca)
        .mockResolvedValueOnce(marcaActualizadaMismoLogo);
      mockMarcaRepository.update.mockResolvedValue({} as UpdateResult);
      mockMarcaMapper.toResponseDto.mockReturnValue({
        // Actualizar mock de respuesta
        ...mockMarcaResponseDto,
        nombre: dtoSinCambioLogo.nombre,
      });

      await service.update(1, dtoSinCambioLogo);

      expect(mockFsUnlink).not.toHaveBeenCalled();
      expect(mockMarcaRepository.update).toHaveBeenCalledWith(
        1,
        dtoSinCambioLogo,
      );
      expect(mockMarcaMapper.toResponseDto).toHaveBeenCalledWith(
        marcaActualizadaMismoLogo,
      ); // Verificar que se mapea el resultado
    });

    it('debería actualizar sin eliminar logo si no había logo antiguo', async () => {
      const marcaSinLogo = { ...mockMarca, logo: null };
      const marcaActualizadaDesdeNull = { ...marcaSinLogo, ...updateDto };
      mockMarcaRepository.findOne
        .mockResolvedValueOnce(marcaSinLogo)
        .mockResolvedValueOnce(marcaActualizadaDesdeNull);
      mockMarcaRepository.update.mockResolvedValue({} as UpdateResult);
      mockMarcaMapper.toResponseDto.mockReturnValue({
        // Actualizar mock de respuesta
        ...mockMarcaResponseDto,
        nombre: updateDto.nombre,
        logoUrl: 'http://.../logo-nuevo.png', // Esperamos la nueva URL
      });

      await service.update(1, updateDto);

      expect(mockFsUnlink).not.toHaveBeenCalled();
      expect(mockMarcaRepository.update).toHaveBeenCalledWith(1, updateDto);
      expect(mockMarcaMapper.toResponseDto).toHaveBeenCalledWith(
        marcaActualizadaDesdeNull,
      ); // Verificar que se mapea el resultado
    });

    it('debería continuar actualizando y loggear error si fs.unlink falla', async () => {
      const errorFs = new Error('Permiso denegado');
      mockMarcaRepository.findOne
        .mockResolvedValueOnce(mockMarca)
        .mockResolvedValueOnce(marcaActualizada);
      mockFsUnlink.mockRejectedValue(errorFs); // fs.unlink falla
      mockMarcaRepository.update.mockResolvedValue({} as UpdateResult);
      mockMarcaMapper.toResponseDto.mockReturnValue({
        ...mockMarcaResponseDto,
        nombre: updateDto.nombre,
        logoUrl: 'http://.../logo-nuevo.png',
      });

      await service.update(1, updateDto);

      expect(mockFsUnlink).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        // Ahora usa el mockLogger correcto
        expect.stringContaining('No se pudo eliminar el logo anterior:'),
        errorFs.stack,
      );
      expect(mockMarcaRepository.update).toHaveBeenCalledWith(1, updateDto);
      expect(mockMarcaMapper.toResponseDto).toHaveBeenCalledWith(
        marcaActualizada,
      );
    });

    it('debería lanzar InternalServerErrorException si la marca actualizada no se encuentra', async () => {
      mockMarcaRepository.findOne
        .mockResolvedValueOnce(mockMarca) // 1ra llamada (check existe)
        .mockResolvedValueOnce(null); // 2da llamada (falla)
      mockMarcaRepository.update.mockResolvedValue({} as UpdateResult);
      // Mockear unlink para que no interfiera si se llama (aunque no debería)
      mockFsUnlink.mockResolvedValue(undefined);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockMarcaRepository.update).toHaveBeenCalledWith(1, updateDto);
      expect(mockMarcaMapper.toResponseDto).not.toHaveBeenCalled();
    });
  });
  // ... remove ...
  describe('remove', () => {
    it('debería lanzar BadRequestException si la marca a eliminar no existe', async () => {
      mockMarcaRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(BadRequestException);
      expect(mockMarcaRepository.remove).not.toHaveBeenCalled();
      expect(mockFsUnlink).not.toHaveBeenCalled();
    });

    it('debería hacer soft delete (sin logo)', async () => {
      const marcaSinLogo = { ...mockMarca, logo: null };
      mockMarcaRepository.findOne.mockResolvedValue(marcaSinLogo);
      mockMarcaRepository.remove.mockResolvedValue({} as UpdateResult);

      await service.remove(1);

      expect(mockMarcaRepository.findOne).toHaveBeenCalledWith(1);
      expect(mockMarcaRepository.remove).toHaveBeenCalledWith(1);
      expect(mockFsUnlink).not.toHaveBeenCalled();
    });

    it('debería hacer soft delete y eliminar el logo (con logo)', async () => {
      mockMarcaRepository.findOne.mockResolvedValue(mockMarca);
      mockMarcaRepository.remove.mockResolvedValue({} as UpdateResult);
      mockFsUnlink.mockResolvedValue(undefined); // fs.unlink éxito

      await service.remove(1);

      expect(mockMarcaRepository.findOne).toHaveBeenCalledWith(1);
      expect(mockMarcaRepository.remove).toHaveBeenCalledWith(1);
      expect(mockFsUnlink).toHaveBeenCalledTimes(1);
      expect(mockFsUnlink).toHaveBeenCalledWith(
        expect.stringContaining(mockMarca.logo),
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        // Ahora usa el mockLogger correcto
        expect.stringContaining('Logo eliminado (soft delete):'),
      );
    });

    it('debería hacer soft delete y loggear error si fs.unlink falla', async () => {
      const errorFs = new Error('Archivo no encontrado');
      mockMarcaRepository.findOne.mockResolvedValue(mockMarca);
      mockMarcaRepository.remove.mockResolvedValue({} as UpdateResult);
      mockFsUnlink.mockRejectedValue(errorFs); // fs.unlink falla

      await service.remove(1); // El servicio NO debe lanzar error

      expect(mockMarcaRepository.findOne).toHaveBeenCalledWith(1);
      expect(mockMarcaRepository.remove).toHaveBeenCalledWith(1);
      expect(mockFsUnlink).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        // Ahora usa el mockLogger correcto
        expect.stringContaining(
          'No se pudo eliminar el logo durante el soft delete:',
        ),
        errorFs.stack,
      );
    });
  });
  // ... restore ...
  describe('restore', () => {
    it('debería restaurar una marca eliminada', async () => {
      const marcaEliminada = { ...mockMarca, deletedAt: new Date() };
      mockMarcaRepository.findOneWithDeleted.mockResolvedValue(marcaEliminada);
      mockMarcaRepository.restore.mockResolvedValue({} as UpdateResult);

      await service.restore(1);

      expect(mockMarcaRepository.findOneWithDeleted).toHaveBeenCalledWith(1);
      expect(mockMarcaRepository.restore).toHaveBeenCalledWith(1);
    });

    it('debería lanzar BadRequestException si la marca no se encuentra (ni eliminada)', async () => {
      mockMarcaRepository.findOneWithDeleted.mockResolvedValue(null);

      await expect(service.restore(99)).rejects.toThrow(BadRequestException);
      await expect(service.restore(99)).rejects.toThrow(
        'Marca no encontrada o no eliminada',
      );
      expect(mockMarcaRepository.restore).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si la marca no está eliminada', async () => {
      const marcaNoEliminada = { ...mockMarca, deletedAt: null };
      mockMarcaRepository.findOneWithDeleted.mockResolvedValue(
        marcaNoEliminada,
      );

      await expect(service.restore(1)).rejects.toThrow(BadRequestException);
      await expect(service.restore(1)).rejects.toThrow(
        'La marca no se encuentra eliminada',
      );
      expect(mockMarcaRepository.restore).not.toHaveBeenCalled();
    });
  });
});
