/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// --- MOCKS DE MÓDULOS ---
// 1. Mockear Swagger (¡ESENCIAL!)
// (Necesario porque los DTOs usan @ApiProperty)
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
import { DetalleProveedorProductoService } from './detalleproveedorproducto.service';
import { IDetalleProveedorProductoRepository } from './repositories/detalle-proveedorproducto-repository.interface';
import { ProductosService } from '../productos/productos.service';
import { ProveedoresService } from '../proveedores/proveedores.service';
import { DetalleProveedorProductoMapper } from './mapper/detalle-proveedor-producto.mapper';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Producto } from '../productos/entities/producto.entity';
import { Proveedor } from '../proveedores/entities/proveedore.entity';
import { DetalleProveedorProducto } from './entities/detalleproveedorproducto.entity';
import { CreateDetalleProveedorProductoServiceDto } from './dto/create-detalle-proveedor-service.dto';
import { RespuestaFindOneDetalleProveedorProductoDto } from './dto/respuesta-find-one-detalleproveedorproducto.dto';
import { CreateDetalleProveedorRepositoryDto } from './dto/create-detalle-proveedor-repository.dto';

// --- MOCK DATA ---
const mockProducto = { id: 1, codigo: 'P001' } as Producto;
const mockProveedor = { id: 1, nombre: 'Proveedor Test' } as Proveedor;

const mockDetalleEntity: DetalleProveedorProducto = {
  id: 1,
  codigo: 'PROV-123',
  producto: mockProducto,
  proveedor: mockProveedor,
} as DetalleProveedorProducto;

const mockCreateServiceDto: CreateDetalleProveedorProductoServiceDto = {
  codigo: 'PROV-123',
  proveedorId: 1,
  producto: mockProducto, // En el DTO de servicio, pasamos el objeto Producto
};

const mockResponseDto: RespuestaFindOneDetalleProveedorProductoDto = {
  id: 1,
  codigo: 'P001', // Código del producto
  proveedorId: 1,
  proveedorNombre: 'Proveedor Test',
};

// --- MOCK PROVIDERS ---
const mockDetalleRepository = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAllByProducto: jest.fn(), // Aunque no se usa en el service, lo mockeamos por completitud
  save: jest.fn(), // Aunque no se usa en el service, lo mockeamos por completitud
};

const mockProductosService = {
  findOne: jest.fn(),
};

const mockProveedoresService = {
  findOne: jest.fn(),
};

const mockDetalleMapper = {
  toResponseDto: jest.fn(),
  toResponsesDto: jest.fn(), // Mockeamos aunque no se usa directamente en el service
};

// --- TEST SUITE ---
describe('DetalleProveedorProductoService', () => {
  let service: DetalleProveedorProductoService;
  let repository: IDetalleProveedorProductoRepository;
  let productosService: ProductosService;
  let proveedoresService: ProveedoresService;
  let mapper: DetalleProveedorProductoMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DetalleProveedorProductoService,
        {
          provide: 'IDetalleProveedorProductoRepository',
          useValue: mockDetalleRepository,
        },
        {
          provide: ProductosService,
          useValue: mockProductosService,
        },
        {
          provide: ProveedoresService,
          useValue: mockProveedoresService,
        },
        {
          provide: DetalleProveedorProductoMapper,
          useValue: mockDetalleMapper,
        },
      ],
    }).compile();

    service = module.get<DetalleProveedorProductoService>(
      DetalleProveedorProductoService,
    );
    repository = module.get<IDetalleProveedorProductoRepository>(
      'IDetalleProveedorProductoRepository',
    );
    productosService = module.get<ProductosService>(ProductosService);
    proveedoresService = module.get<ProveedoresService>(ProveedoresService);
    mapper = module.get<DetalleProveedorProductoMapper>(
      DetalleProveedorProductoMapper,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // Pruebas para el método create()
  describe('create', () => {
    it('debería crear un detalle exitosamente', async () => {
      mockProductosService.findOne.mockResolvedValue(mockProducto);
      mockProveedoresService.findOne.mockResolvedValue(mockProveedor);
      mockDetalleRepository.create.mockResolvedValue(mockDetalleEntity);
      mockDetalleMapper.toResponseDto.mockReturnValue(mockResponseDto);

      const result = await service.create(mockCreateServiceDto);

      expect(productosService.findOne).toHaveBeenCalledWith(
        mockCreateServiceDto.producto.id,
      );
      expect(proveedoresService.findOne).toHaveBeenCalledWith(
        mockCreateServiceDto.proveedorId,
      );
      // Verifica que el DTO para el repo se construya correctamente
      const expectedRepoDto: CreateDetalleProveedorRepositoryDto = {
        codigo: mockCreateServiceDto.codigo,
        producto: mockProducto,
        proveedor: mockProveedor,
      };
      expect(repository.create).toHaveBeenCalledWith(expectedRepoDto);
      expect(mapper.toResponseDto).toHaveBeenCalledWith(mockDetalleEntity);
      expect(result).toEqual(mockResponseDto);
    });

    it('debería lanzar NotFoundException si el producto no existe', async () => {
      mockProductosService.findOne.mockResolvedValue(null); // Producto no encontrado

      await expect(service.create(mockCreateServiceDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(mockCreateServiceDto)).rejects.toThrow(
        `No se encontró el producto con ID ${mockCreateServiceDto.producto.id}`,
      );
      expect(proveedoresService.findOne).not.toHaveBeenCalled(); // No debe continuar
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el proveedor no existe', async () => {
      mockProductosService.findOne.mockResolvedValue(mockProducto);
      mockProveedoresService.findOne.mockResolvedValue(null); // Proveedor no encontrado

      await expect(service.create(mockCreateServiceDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(mockCreateServiceDto)).rejects.toThrow(
        `No se encontró el proveedor con ID ${mockCreateServiceDto.proveedorId}`,
      );
      expect(repository.create).not.toHaveBeenCalled(); // No debe continuar
    });

    it('debería propagar error si repository.create falla', async () => {
      const dbError = new InternalServerErrorException('DB error');
      mockProductosService.findOne.mockResolvedValue(mockProducto);
      mockProveedoresService.findOne.mockResolvedValue(mockProveedor);
      mockDetalleRepository.create.mockRejectedValue(dbError); // Repo falla

      await expect(service.create(mockCreateServiceDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mapper.toResponseDto).not.toHaveBeenCalled();
    });
  });

  // Pruebas para el método createDetalles()
  describe('createDetalles', () => {
    const mockCreateServiceDto2: CreateDetalleProveedorProductoServiceDto = {
      codigo: 'PROV-456',
      proveedorId: 2,
      producto: { id: 2 } as Producto, // Otro producto
    };
    const mockResponseDto2: RespuestaFindOneDetalleProveedorProductoDto = {
      id: 2,
      codigo: 'P002',
      proveedorId: 2,
      proveedorNombre: 'Proveedor 2',
    };
    const dtos = [mockCreateServiceDto, mockCreateServiceDto2];

    it('debería llamar a create para cada DTO y devolver un array de resultados', async () => {
      // Usamos spyOn para mockear el 'create' del *mismo* servicio
      const createSpy = jest.spyOn(service, 'create');
      createSpy
        .mockResolvedValueOnce(mockResponseDto) // Primera llamada
        .mockResolvedValueOnce(mockResponseDto2); // Segunda llamada

      const result = await service.createDetalles(dtos);

      expect(createSpy).toHaveBeenCalledTimes(dtos.length);
      expect(createSpy).toHaveBeenNthCalledWith(1, mockCreateServiceDto);
      expect(createSpy).toHaveBeenNthCalledWith(2, mockCreateServiceDto2);
      expect(result).toEqual([mockResponseDto, mockResponseDto2]);

      createSpy.mockRestore(); // Importante restaurar el spy
    });

    it('debería lanzar la excepción si una llamada a create falla', async () => {
      const error = new NotFoundException('Producto no encontrado');
      // Usamos spyOn para mockear el 'create' del *mismo* servicio
      const createSpy = jest.spyOn(service, 'create');
      createSpy
        .mockResolvedValueOnce(mockResponseDto) // La primera llamada funciona
        .mockRejectedValueOnce(error); // La segunda llamada falla

      // La excepción del segundo 'create' debe propagarse
      await expect(service.createDetalles(dtos)).rejects.toThrow(
        NotFoundException,
      );

      expect(createSpy).toHaveBeenCalledTimes(2); // Se intentaron llamar ambas

      createSpy.mockRestore(); // Importante restaurar el spy
    });

    it('debería devolver un array vacío si la entrada es vacía', async () => {
      const createSpy = jest.spyOn(service, 'create');
      const result = await service.createDetalles([]);
      expect(result).toEqual([]);
      expect(createSpy).not.toHaveBeenCalled();
      createSpy.mockRestore();
    });
  });

  // Pruebas para el método findOne()
  describe('findOne', () => {
    it('debería encontrar un detalle por ID y mapearlo a DTO', async () => {
      mockDetalleRepository.findOne.mockResolvedValue(mockDetalleEntity);
      mockDetalleMapper.toResponseDto.mockReturnValue(mockResponseDto);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(mapper.toResponseDto).toHaveBeenCalledWith(mockDetalleEntity);
      expect(result).toEqual(mockResponseDto);
    });

    it('debería lanzar NotFoundException si el detalle no se encuentra', async () => {
      mockDetalleRepository.findOne.mockResolvedValue(null); // No encontrado

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow(
        `No se encontró el detalle con ID 99`,
      );
      expect(mapper.toResponseDto).not.toHaveBeenCalled(); // No debe mapear
    });

    it('debería propagar error si repository.findOne falla', async () => {
      const dbError = new InternalServerErrorException('DB error');
      mockDetalleRepository.findOne.mockRejectedValue(dbError); // Repo falla

      await expect(service.findOne(1)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mapper.toResponseDto).not.toHaveBeenCalled();
    });
  });
});
