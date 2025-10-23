import { Test, TestingModule } from '@nestjs/testing';
import { VentasService } from './ventas.service';
import { IVentasRepository } from './repositories/ventas-repository.interface';
import { VentasMapper } from './mappers/ventas.mapper';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Venta } from './entities/venta.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { RespuestaCreateVentaDto } from './dto/respuesta-create-venta.dto';
import { PaginationDto } from './dto/pagination.dto';
import { RespuestaFindAllPaginatedVentaDTO } from './dto/respuesta-find-all-paginated-venta.dto';
import { RespuestaFindOneVentaDto } from './dto/respuesta-find-one-venta.dto';
import { NotFoundException } from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional';

// --- Mocks y Datos de Prueba ---

// 1. Datos falsos (stubs)
const mockUsuario: Usuario = {
  id: 1,
  nombre: 'Alejo',
  apellido: 'De Miguel',
} as Usuario;

const mockVenta: Venta = {
  id: 1,
  total: 150.75,
  medioDePago: 'efectivo',
  vendedor: mockUsuario,
  fechaCreacion: new Date(),
  detalleVentas: [],
  fechaActualizacion: new Date(),
  fechaEliminacion: new Date(),
} as Venta;

// 2. Tipos para los Mocks
type MockRepository = Partial<Record<keyof IVentasRepository, jest.Mock>>;
type MockMapper = Partial<Record<keyof VentasMapper, jest.Mock>>;

// 3. Fábricas de Mocks
const createMockRepository = (): MockRepository => ({
  create: jest.fn(),
  findAllPaginated: jest.fn(),
  findOne: jest.fn(),
});

// Mockeamos el mapper con 'useValue' para no tener que mockear 'DetalleVentaMapper'
const createMockMapper = (): MockMapper => ({
  toRespuestaCreateVentaDto: jest.fn(),
  toRespuestaFindAllPaginatedVentaDTO: jest.fn(),
  toRespuestaFinalFindOneDto: jest.fn(),
  toRespuestaFindAllVentaDTO: jest.fn(),
});

// Mockeamos el @Transactional
jest.mock('typeorm-transactional', () => ({
  initializeTransactionalContext: jest.fn(),
  addTransactionalDataSource: jest.fn(),
  Transactional: () => () => {}, // Ignora el decorador
}));

// --- Suite de Pruebas ---

describe('VentasService', () => {
  let service: VentasService;
  let repository: MockRepository;
  let mapper: MockMapper;

  // AÑADE UN beforeAll PARA INICIALIZAR EL CONTEXTO
  beforeAll(() => {
    initializeTransactionalContext();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // 1. El servicio real
        VentasService,
        // 2. Mocks de sus dependencias
        {
          provide: 'IVentasRepository', // ¡Usar el token de inyección!
          useValue: createMockRepository(),
        },
        {
          provide: VentasMapper, // Usamos la clase como token
          useValue: createMockMapper(), // Pero proveemos un mock simple
        },
      ],
    }).compile();

    service = module.get<VentasService>(VentasService);
    repository = module.get<MockRepository>('IVentasRepository');
    mapper = module.get<MockMapper>(VentasMapper);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // --- Pruebas para create() ---
  describe('create', () => {
    it('debería crear una venta y retornar el DTO mapeado', async () => {
      const createDto: CreateVentaDto = {
        detalles: [{ productoId: 1, cantidad: 2 }],
        medioDePago: 'efectivo',
      };
      const mockRespuestaDto: RespuestaCreateVentaDto = {
        id: 1,
        total: 150.75,
        medioDePago: 'efectivo',
        vendedor: 'Alejo De Miguel',
        fecha: mockVenta.fechaCreacion,
      };

      // Configuramos los mocks
      repository.create?.mockResolvedValue(mockVenta);
      mapper.toRespuestaCreateVentaDto?.mockReturnValue(mockRespuestaDto);

      // Ejecutamos
      const result = await service.create(createDto, mockUsuario);

      // Verificamos
      expect(repository.create).toHaveBeenCalledWith(createDto, mockUsuario);
      expect(mapper.toRespuestaCreateVentaDto).toHaveBeenCalledWith(mockVenta);
      expect(result).toEqual(mockRespuestaDto);
    });
  });

  // --- Pruebas para findAllPaginated() ---
  describe('findAllPaginated', () => {
    it('debería retornar ventas paginadas y mapeadas', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 5 };
      const repoResult = {
        ventas: [mockVenta],
        total: 1,
        page: 1,
        lastPage: 1,
      };
      const mapperResult: RespuestaFindAllPaginatedVentaDTO = {
        ventas: [], // El mapper los transformaría
        total: 1,
        page: 1,
        lastPage: 1,
      };

      // Configuramos los mocks
      repository.findAllPaginated?.mockResolvedValue(repoResult);
      mapper.toRespuestaFindAllPaginatedVentaDTO?.mockReturnValue(mapperResult);

      // Ejecutamos
      const result = await service.findAllPaginated(paginationDto);

      // Verificamos
      expect(repository.findAllPaginated).toHaveBeenCalledWith(
        paginationDto.page,
        paginationDto.limit,
      );
      expect(mapper.toRespuestaFindAllPaginatedVentaDTO).toHaveBeenCalledWith(
        repoResult,
      );
      expect(result).toEqual(mapperResult);
    });

    it('debería usar valores por defecto (page 1, limit 10) si no se proveen', async () => {
      const paginationDto: PaginationDto = {}; // DTO vacío
      const repoResult = { ventas: [], total: 0, page: 1, lastPage: 1 };
      const mapperResult: RespuestaFindAllPaginatedVentaDTO = {
        ventas: [],
        total: 0,
        page: 1,
        lastPage: 1,
      };

      // Configuramos los mocks
      repository.findAllPaginated?.mockResolvedValue(repoResult);
      mapper.toRespuestaFindAllPaginatedVentaDTO?.mockReturnValue(mapperResult);

      // Ejecutamos
      await service.findAllPaginated(paginationDto);

      // Verificamos que se usaron los defaults
      expect(repository.findAllPaginated).toHaveBeenCalledWith(1, 10);
    });
  });

  // --- Pruebas para findOne() ---
  describe('findOne', () => {
    it('debería retornar una venta mapeada si se encuentra', async () => {
      const ventaId = 1;
      const mockRespuestaDto: RespuestaFindOneVentaDto = {
        id: 1,
        total: 150.75,
        medioDePago: 'efectivo',
        vendedor: 'Alejo De Miguel',
        fecha: mockVenta.fechaCreacion,
        detalles: [],
      };

      // Configuramos los mocks
      repository.findOne?.mockResolvedValue(mockVenta);
      mapper.toRespuestaFinalFindOneDto?.mockReturnValue(mockRespuestaDto);

      // Ejecutamos
      const result = await service.findOne(ventaId);

      // Verificamos
      expect(repository.findOne).toHaveBeenCalledWith(ventaId);
      expect(mapper.toRespuestaFinalFindOneDto).toHaveBeenCalledWith(mockVenta);
      expect(result).toEqual(mockRespuestaDto);
    });

    it('debería lanzar NotFoundException si la venta no se encuentra', async () => {
      const ventaId = 99;

      // Configuramos el mock del repositorio para que retorne null
      repository.findOne?.mockResolvedValue(null);

      // Ejecutamos y Verificamos
      await expect(service.findOne(ventaId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(ventaId)).rejects.toThrow(
        `No se encontró la venta con ID ${ventaId}`,
      );

      // Verificamos que el mapper NUNCA fue llamado
      expect(mapper.toRespuestaFinalFindOneDto).not.toHaveBeenCalled();
    });
  });
});
