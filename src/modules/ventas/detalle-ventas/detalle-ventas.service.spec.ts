import { Test, TestingModule } from '@nestjs/testing';
import { DetalleVentasService } from './detalle-ventas.service';
import { IDetalleVentasRepository } from './repositories/detalle-ventas-repository.interface';
import { DetalleVentasValidator } from './helpers/detalle-venta.validator';
import { ProductosService } from '../../../modules/productos/productos.service';
import { DetalleVentaMapper } from './mappers/detalle-venta.mapper';
import { Venta } from '../entities/venta.entity';
import { Producto } from '../../../modules/productos/entities/producto.entity';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { DetalleVentaDto } from './dto/detalle-venta.dto';
import { RespuestaFindOneDetalleVentaDto } from './dto/respuesta-find-one-detalle-venta.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// --- Mocks y Datos de Prueba ---

// 1. Datos falsos (stubs)
const mockVenta: Venta = { id: 1 } as Venta;

const mockProducto1: Producto = {
  id: 1,
  nombre: 'Producto A',
  precio: 100,
  stock: 10,
} as Producto;

const mockProducto2: Producto = {
  id: 2,
  nombre: 'Producto B',
  precio: 50,
  stock: 5,
} as Producto;

const mockDetalleVenta: DetalleVenta = {
  id: 1,
  producto: mockProducto1,
  cantidad: 2,
  precioUnitario: 100,
  venta: mockVenta,
} as DetalleVenta;

// 2. Tipos para los Mocks
type MockRepository = Partial<
  Record<keyof IDetalleVentasRepository, jest.Mock>
>;
type MockValidator = Partial<Record<keyof DetalleVentasValidator, jest.Mock>>;
type MockProductosService = Partial<Record<keyof ProductosService, jest.Mock>>;
type MockMapper = Partial<Record<keyof DetalleVentaMapper, jest.Mock>>;

// 3. Fábricas de Mocks
const createMockRepository = (): MockRepository => ({
  create: jest.fn(),
  findOne: jest.fn(),
});

const createMockValidator = (): MockValidator => ({
  validateExistenciaYStock: jest.fn(),
});

// Nota: Mockeamos ProductosService con useValue,
// así no necesitamos sus dependencias (IProductosRepository, etc.)
const createMockProductosService = (): MockProductosService => ({
  decrementarStock: jest.fn(),
});

const createMockMapper = (): MockMapper => ({
  toResponseDto: jest.fn(),
});

// --- Suite de Pruebas ---

describe('DetalleVentasService', () => {
  let service: DetalleVentasService;
  let repository: MockRepository;
  let validator: MockValidator;
  let productosService: MockProductosService;
  let mapper: MockMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // 1. El servicio real
        DetalleVentasService,
        // 2. Mocks de sus 4 dependencias
        {
          provide: 'IDetalleVentasRepository',
          useValue: createMockRepository(),
        },
        {
          provide: DetalleVentasValidator,
          useValue: createMockValidator(),
        },
        {
          provide: ProductosService,
          useValue: createMockProductosService(),
        },
        {
          provide: DetalleVentaMapper,
          useValue: createMockMapper(),
        },
      ],
    }).compile();

    service = module.get<DetalleVentasService>(DetalleVentasService);
    repository = module.get<MockRepository>('IDetalleVentasRepository');
    validator = module.get<MockValidator>(DetalleVentasValidator);
    productosService = module.get<MockProductosService>(ProductosService);
    mapper = module.get<MockMapper>(DetalleVentaMapper);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // --- Pruebas para create() ---
  describe('create', () => {
    it('debería llamar al repositorio.create con los datos correctos', async () => {
      const createDto: CreateDetalleVentaDto = {
        venta: mockVenta,
        producto: mockProducto1,
        cantidad: 2,
        precioUnitario: 100,
      };
      repository.create?.mockResolvedValue(mockDetalleVenta);

      await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
    });
  });

  // --- Pruebas para findOne() ---
  describe('findOne', () => {
    it('debería encontrar un detalle y mapearlo a DTO', async () => {
      const detalleId = 1;
      const mockResponseDto: RespuestaFindOneDetalleVentaDto = {
        id: 1,
        cantidad: 2,
        precioUnitario: 100,
        subtotal: 200,
        productoId: 1,
        productoNombre: 'Producto A',
      };

      repository.findOne?.mockResolvedValue(mockDetalleVenta);
      mapper.toResponseDto?.mockReturnValue(mockResponseDto);

      const result = await service.findOne(detalleId);

      expect(repository.findOne).toHaveBeenCalledWith(detalleId);
      expect(mapper.toResponseDto).toHaveBeenCalledWith(mockDetalleVenta);
      expect(result).toEqual(mockResponseDto);
    });

    it('debería lanzar NotFoundException si el detalle no existe', async () => {
      const detalleId = 99;
      repository.findOne?.mockResolvedValue(null);

      await expect(service.findOne(detalleId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(detalleId)).rejects.toThrow(
        `No se encontró el detalleVenta con ID ${detalleId}`,
      );
      expect(mapper.toResponseDto).not.toHaveBeenCalled();
    });
  });

  // --- Pruebas para createDetalles() ---
  describe('createDetalles', () => {
    it('debería procesar todos los detalles, crear, decrementar stock y retornar el total', async () => {
      const detallesDto: DetalleVentaDto[] = [
        { productoId: 1, cantidad: 2 },
        { productoId: 2, cantidad: 1 },
      ];
      // total = (100 * 2) + (50 * 1) = 250
      const expectedTotal = 250;

      // Configurar Mocks
      // 1. Validator: debe devolver el producto correspondiente a cada ID
      validator.validateExistenciaYStock?.mockImplementation((id: number) => {
        if (id === 1) return mockProducto1;
        if (id === 2) return mockProducto2;
        return null;
      });
      // 2. Repository.create (no necesitamos su respuesta)
      repository.create?.mockResolvedValue(undefined);
      // 3. ProductosService.decrementarStock (no necesitamos su respuesta)
      productosService.decrementarStock?.mockResolvedValue(undefined);

      // Act
      const result = await service.createDetalles(mockVenta, detallesDto);

      // Assert
      // 1. Verificar el total
      expect(result).toEqual({ total: expectedTotal });

      // 2. Verificar las llamadas al validador (una por cada item)
      expect(validator.validateExistenciaYStock).toHaveBeenCalledTimes(2);
      expect(validator.validateExistenciaYStock).toHaveBeenCalledWith(1, 2);
      expect(validator.validateExistenciaYStock).toHaveBeenCalledWith(2, 1);

      // 3. Verificar las llamadas a repository.create (una por cada item)
      expect(repository.create).toHaveBeenCalledTimes(2);
      expect(repository.create).toHaveBeenCalledWith({
        venta: mockVenta,
        producto: mockProducto1,
        cantidad: 2,
        precioUnitario: 100, // mockProducto1.precio
      });
      expect(repository.create).toHaveBeenCalledWith({
        venta: mockVenta,
        producto: mockProducto2,
        cantidad: 1,
        precioUnitario: 50, // mockProducto2.precio
      });

      // 4. Verificar las llamadas a productosService.decrementarStock (una por cada item)
      expect(productosService.decrementarStock).toHaveBeenCalledTimes(2);
      expect(productosService.decrementarStock).toHaveBeenCalledWith(
        mockProducto1,
        2,
      );
      expect(productosService.decrementarStock).toHaveBeenCalledWith(
        mockProducto2,
        1,
      );
    });

    it('debería lanzar excepción si el validador falla y no crear/decrementar nada', async () => {
      const detallesDto: DetalleVentaDto[] = [
        { productoId: 1, cantidad: 99 }, // Stock insuficiente
      ];

      // Configurar Mocks
      validator.validateExistenciaYStock?.mockRejectedValue(
        new BadRequestException('Stock insuficiente'),
      );

      // Act & Assert
      await expect(
        service.createDetalles(mockVenta, detallesDto),
      ).rejects.toThrow(BadRequestException);

      // Verificar que el validador fue llamado
      expect(validator.validateExistenciaYStock).toHaveBeenCalledWith(1, 99);

      // ¡CRUCIAL! Verificar que NO se continuó con la creación ni el decremento
      expect(repository.create).not.toHaveBeenCalled();
      expect(productosService.decrementarStock).not.toHaveBeenCalled();
    });
  });
});
