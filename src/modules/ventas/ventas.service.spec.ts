/* eslint-disable @typescript-eslint/unbound-method */
// --- MOCKS DE MÓDULOS ---
// 1. Mockear typeorm-transactional (¡LA CLAVE!)
// Hacemos que el decorador @Transactional no haga nada.
jest.mock('typeorm-transactional', () => ({
  Transactional:
    () => (target: any, key: string, descriptor: PropertyDescriptor) =>
      descriptor,
  initializeTransactionalContext: jest.fn(), // Mockear por si acaso
  addTransactionalDataSource: jest.fn(), // Mockear por si acaso
}));

// 2. Mockear Swagger (¡ESENCIAL!)
// (Necesario porque los DTOs usan @ApiProperty)
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger, // Mantiene ApiProperty, ApiTags, etc.
  // No necesitamos mockear los decoradores aquí si solo importamos DTOs
}));

// --- IMPORTS REALES ---
import { Test, TestingModule } from '@nestjs/testing';
import { VentasService } from './ventas.service';
import { IVentasRepository } from './repositories/ventas-repository.interface';
import { VentasMapper } from './mappers/ventas.mapper';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { PaginationDto } from './dto/pagination.dto';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Venta } from './entities/venta.entity';
import { RespuestaCreateVentaDto } from './dto/respuesta-create-venta.dto';
import { RespuestaFindOneVentaDto } from './dto/respuesta-find-one-venta.dto';
import { RespuestaFindAllPaginatedVentaDTO } from './dto/respuesta-find-all-paginated-venta.dto';
import { DetalleVentaDto } from '../detalle-ventas/dto/detalle-venta.dto'; // Needed for CreateVentaDto

// --- MOCK DATA ---
const mockUsuario: Usuario = {
  id: 1,
  nombre: 'Test',
  apellido: 'User',
} as Usuario;

const mockDetalleDto: DetalleVentaDto = {
  productoId: 1,
  cantidad: 2,
  precioUnitario: 50,
};
const mockCreateVentaDto: CreateVentaDto = {
  detalles: [mockDetalleDto],
  medioDePago: 'efectivo',
};

const mockVenta: Venta = {
  id: 1,
  total: 100,
  medioDePago: 'efectivo',
  vendedor: mockUsuario,
  fechaCreacion: new Date(),
  detalleVentas: [], // El repo create usualmente devuelve esto ya populado
} as Venta;

const mockRespuestaCreateDto: RespuestaCreateVentaDto = {
  id: 1,
  total: 100,
  medioDePago: 'efectivo',
  vendedor: 'Test User',
  fecha: mockVenta.fechaCreacion,
};

const mockRespuestaFindOneDto: RespuestaFindOneVentaDto = {
  id: 1,
  total: 100,
  medioDePago: 'efectivo',
  vendedor: 'Test User',
  fecha: mockVenta.fechaCreacion,
  detalles: [], // El mapper lo llenaría
};

// --- MOCK PROVIDERS ---
const mockVentasRepository = {
  create: jest.fn(),
  findAllPaginated: jest.fn(),
  findOne: jest.fn(),
};

const mockVentasMapper = {
  toRespuestaCreateVentaDto: jest.fn(),
  toRespuestaFindAllPaginatedVentaDTO: jest.fn(),
  toRespuestaFinalFindOneDto: jest.fn(),
};

const mockHistorialService = {
  create: jest.fn(),
};

// --- TEST SUITE ---
describe('VentasService', () => {
  let service: VentasService;
  let repository: IVentasRepository;
  let mapper: VentasMapper;
  let historial: HistorialActividadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VentasService,
        {
          provide: 'IVentasRepository',
          useValue: mockVentasRepository,
        },
        {
          provide: VentasMapper,
          useValue: mockVentasMapper,
        },
        {
          provide: HistorialActividadesService,
          useValue: mockHistorialService,
        },
      ],
    }).compile();

    service = module.get<VentasService>(VentasService);
    repository = module.get<IVentasRepository>('IVentasRepository');
    mapper = module.get<VentasMapper>(VentasMapper);
    historial = module.get<HistorialActividadesService>(
      HistorialActividadesService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // Pruebas para create()
  describe('create', () => {
    it('debería crear una venta, registrar historial exitoso y mapear la respuesta', async () => {
      mockVentasRepository.create.mockResolvedValue(mockVenta);
      mockHistorialService.create.mockResolvedValue({}); // El resultado no importa
      mockVentasMapper.toRespuestaCreateVentaDto.mockReturnValue(
        mockRespuestaCreateDto,
      );

      const result = await service.create(mockCreateVentaDto, mockUsuario);

      expect(repository.create).toHaveBeenCalledWith(
        mockCreateVentaDto,
        mockUsuario,
      );
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 16,
        estadoId: 1, // Exitoso
      });
      expect(mapper.toRespuestaCreateVentaDto).toHaveBeenCalledWith(mockVenta);
      expect(result).toEqual(mockRespuestaCreateDto);
    });

    it('debería fallar al crear, registrar historial fallido y lanzar el error', async () => {
      const dbError = new InternalServerErrorException(
        'Error al guardar venta',
      );
      mockVentasRepository.create.mockRejectedValue(dbError);
      mockHistorialService.create.mockResolvedValue({}); // El resultado no importa

      await expect(
        service.create(mockCreateVentaDto, mockUsuario),
      ).rejects.toThrow(dbError);

      expect(repository.create).toHaveBeenCalledWith(
        mockCreateVentaDto,
        mockUsuario,
      );
      // Verifica que se llamó al historial con estado fallido
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 16,
        estadoId: 2, // Fallido
      });
      // Verifica que el mapper no fue llamado
      expect(mapper.toRespuestaCreateVentaDto).not.toHaveBeenCalled();
    });
  });

  // Pruebas para findAllPaginated()
  describe('findAllPaginated', () => {
    const repoResult = { ventas: [mockVenta], total: 1, page: 1, lastPage: 1 };
    const mappedResult = {
      ventas: [mockRespuestaFindOneDto],
      total: 1,
      page: 1,
      lastPage: 1,
    } as RespuestaFindAllPaginatedVentaDTO;

    it('debería obtener ventas paginadas con valores por defecto (page 1, limit 10)', async () => {
      mockVentasRepository.findAllPaginated.mockResolvedValue(repoResult);
      mockVentasMapper.toRespuestaFindAllPaginatedVentaDTO.mockReturnValue(
        mappedResult,
      );

      const result = await service.findAllPaginated({}); // DTO vacío

      expect(repository.findAllPaginated).toHaveBeenCalledWith(1, 10); // Verifica defaults
      expect(mapper.toRespuestaFindAllPaginatedVentaDTO).toHaveBeenCalledWith(
        repoResult,
      );
      expect(result).toEqual(mappedResult);
    });

    it('debería obtener ventas paginadas con valores provistos', async () => {
      const paginationDto: PaginationDto = { page: 2, limit: 5 };
      mockVentasRepository.findAllPaginated.mockResolvedValue(repoResult); // El resultado del repo no cambia
      mockVentasMapper.toRespuestaFindAllPaginatedVentaDTO.mockReturnValue(
        mappedResult,
      ); // El resultado mapeado no cambia

      const result = await service.findAllPaginated(paginationDto);

      expect(repository.findAllPaginated).toHaveBeenCalledWith(2, 5); // Verifica valores provistos
      expect(mapper.toRespuestaFindAllPaginatedVentaDTO).toHaveBeenCalledWith(
        repoResult,
      );
      expect(result).toEqual(mappedResult);
    });

    it('debería propagar error si repository.findAllPaginated falla', async () => {
      const dbError = new Error('DB Error');
      mockVentasRepository.findAllPaginated.mockRejectedValue(dbError);

      await expect(service.findAllPaginated({})).rejects.toThrow(dbError);
      expect(mapper.toRespuestaFindAllPaginatedVentaDTO).not.toHaveBeenCalled();
    });
  });

  // Pruebas para findOne()
  describe('findOne', () => {
    it('debería encontrar una venta por ID y mapearla a DTO', async () => {
      mockVentasRepository.findOne.mockResolvedValue(mockVenta);
      mockVentasMapper.toRespuestaFinalFindOneDto.mockReturnValue(
        mockRespuestaFindOneDto,
      );

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(mapper.toRespuestaFinalFindOneDto).toHaveBeenCalledWith(mockVenta);
      expect(result).toEqual(mockRespuestaFindOneDto);
    });

    it('debería lanzar NotFoundException si la venta no se encuentra', async () => {
      mockVentasRepository.findOne.mockResolvedValue(null); // Venta no encontrada

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow(
        `No se encontró la venta con ID 99`,
      );
      // Verifica que el mapper no fue llamado
      expect(mapper.toRespuestaFinalFindOneDto).not.toHaveBeenCalled();
    });

    it('debería propagar error si repository.findOne falla', async () => {
      const dbError = new Error('DB Error');
      mockVentasRepository.findOne.mockRejectedValue(dbError);

      await expect(service.findOne(1)).rejects.toThrow(dbError);
      expect(mapper.toRespuestaFinalFindOneDto).not.toHaveBeenCalled();
    });
  });
});
