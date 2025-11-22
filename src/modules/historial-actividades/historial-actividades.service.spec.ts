/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/unbound-method */
// --- MOCKS DE MÓDULOS ---
// 1. Mockear Swagger (¡ESENCIAL!)
// (Necesario porque los DTOs usan @ApiProperty)
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger, // Mantiene ApiProperty, ApiTags, etc.
}));

// --- IMPORTS REALES ---
import { Test, TestingModule } from '@nestjs/testing';
import { HistorialActividadesService } from './historial-actividades.service';
import { IHistorialActividadesRepository } from './repository/historial-actividades-repository.interface';
import { HistorialActividadesMapper } from './mappers/historial.mapper';
import { CreateHistorialActividadesDto } from './dto/create-historial-actividades.dto';
import { PaginacionDto } from './dto/Paginacion.dto';
import { HistorialActividades } from './entities/historial-actividade.entity'; // Asegúrate de importar la entidad real
import { RespuestaCreateHistorialDto } from './dto/respuesta-create-historial.dto';
import { RespuestaFindAllPaginatedHistorialDTO } from './dto/RespuestaFindAllPaginatedHistorial.dto';
import { InternalServerErrorException } from '@nestjs/common';

// --- MOCK DATA ---
const mockCreateDto: CreateHistorialActividadesDto = {
  usuario: 1,
  accionId: 10, // Ejemplo: Crear Marca
  estadoId: 1, // Ejemplo: Éxito
};

const mockHistorialEntity: HistorialActividades = {
  id: 1,
  usuario: { id: 1 } as any, // Simular relaciones
  accion: { id: 10, nombre: 'Crear Marca' } as any,
  estado: { id: 1, nombre: 'Éxito' } as any,
  fechaHora: new Date(),
} as HistorialActividades;

const mockRespuestaCreateDto: RespuestaCreateHistorialDto = {
  id: 1,
  usuario: { id: 1 } as any,
  accion: 'Crear Marca',
  estado: 'Éxito',
  fechaHora: mockHistorialEntity.fechaHora,
};

const mockPaginatedRepoResult = {
  historial: [mockHistorialEntity],
  total: 1,
  page: 1,
  lastPage: 1,
};

const mockPaginatedMappedResult: RespuestaFindAllPaginatedHistorialDTO = {
  data: [
    // Mapper.toResponse formatea diferente
    {
      id: 1,
      usuario: { id: 1 } as any,
      accion: { id: 10, nombre: 'Crear Marca' } as any,
      estado: { id: 1, nombre: 'Éxito' } as any,
      fechaHora: mockHistorialEntity.fechaHora,
    },
  ],
  total: 1,
  page: 1,
  lastPage: 1,
};

// --- MOCK PROVIDERS ---
const mockHistorialRepository = {
  create: jest.fn(),
  findAllPaginated: jest.fn(),
};

const mockHistorialMapper = {
  toRespuestaCreateDto: jest.fn(),
  toPaginatedResponse: jest.fn(),
};

// --- TEST SUITE ---
describe('HistorialActividadesService', () => {
  let service: HistorialActividadesService;
  let repository: IHistorialActividadesRepository;
  let mapper: HistorialActividadesMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistorialActividadesService,
        {
          provide: 'IHistorialActividadesRepository',
          useValue: mockHistorialRepository,
        },
        {
          provide: HistorialActividadesMapper,
          useValue: mockHistorialMapper,
        },
      ],
    }).compile();

    service = module.get<HistorialActividadesService>(
      HistorialActividadesService,
    );
    repository = module.get<IHistorialActividadesRepository>(
      'IHistorialActividadesRepository',
    );
    mapper = module.get<HistorialActividadesMapper>(HistorialActividadesMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // Pruebas para create()
  describe('create', () => {
    it('debería crear una entrada de historial y mapear la respuesta', async () => {
      mockHistorialRepository.create.mockResolvedValue(mockHistorialEntity);
      mockHistorialMapper.toRespuestaCreateDto.mockReturnValue(
        mockRespuestaCreateDto,
      );

      const result = await service.create(mockCreateDto);

      expect(repository.create).toHaveBeenCalledWith(mockCreateDto);
      expect(mapper.toRespuestaCreateDto).toHaveBeenCalledWith(
        mockHistorialEntity,
      );
      expect(result).toEqual(mockRespuestaCreateDto);
    });

    it('debería propagar error si repository.create falla', async () => {
      const dbError = new InternalServerErrorException('DB Error');
      mockHistorialRepository.create.mockRejectedValue(dbError);

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mapper.toRespuestaCreateDto).not.toHaveBeenCalled(); // Mapper no debe ser llamado
    });
  });

  // Pruebas para findAllPaginated()
  describe('findAllPaginated', () => {
    it('debería obtener historial paginado con valores por defecto y mapear respuesta', async () => {
      mockHistorialRepository.findAllPaginated.mockResolvedValue(
        mockPaginatedRepoResult,
      );
      mockHistorialMapper.toPaginatedResponse.mockReturnValue(
        mockPaginatedMappedResult,
      );

      const result = await service.findAllPaginated({}); // DTO vacío

      // Verifica que se llamen con los defaults y undefined para search/action
      expect(repository.findAllPaginated).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
      );
      expect(mapper.toPaginatedResponse).toHaveBeenCalledWith(
        mockPaginatedRepoResult,
      );
      expect(result).toEqual(mockPaginatedMappedResult);
    });

    it('debería obtener historial paginado con todos los valores provistos y mapear respuesta', async () => {
      const paginationDto: PaginacionDto = {
        page: 2,
        limit: 5,
        search: 'testuser',
        action: 'login',
      };
      mockHistorialRepository.findAllPaginated.mockResolvedValue(
        mockPaginatedRepoResult,
      ); // El resultado del repo no cambia
      mockHistorialMapper.toPaginatedResponse.mockReturnValue(
        mockPaginatedMappedResult,
      ); // El resultado mapeado no cambia

      const result = await service.findAllPaginated(paginationDto);

      // Verifica que se llamen con los valores provistos
      expect(repository.findAllPaginated).toHaveBeenCalledWith(
        paginationDto.page,
        paginationDto.limit,
        paginationDto.search,
        paginationDto.action,
      );
      expect(mapper.toPaginatedResponse).toHaveBeenCalledWith(
        mockPaginatedRepoResult,
      );
      expect(result).toEqual(mockPaginatedMappedResult);
    });

    it('debería propagar error si repository.findAllPaginated falla', async () => {
      const dbError = new InternalServerErrorException('DB Error');
      mockHistorialRepository.findAllPaginated.mockRejectedValue(dbError);

      await expect(service.findAllPaginated({})).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mapper.toPaginatedResponse).not.toHaveBeenCalled(); // Mapper no debe ser llamado
    });
  });
});
