/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// --- MOCKS DE MÓDULOS ---
// 1. Mockear Swagger para evitar el crash de importación
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
import { ProductosService } from './productos.service';
import { IProductosRepository } from './repository/producto-repository.interface';
import { ProductoMapper } from './mapper/producto.mapper';
import { ProductosValidator } from './helpers/productos-validator';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { DeleteProductoDto } from './dto/delete-producto.dto';
import { BadRequestException } from '@nestjs/common';
import { RespuestaFindAllPaginatedProductoDTO } from './dto/respuesta-find-all-paginated.dto';
import { UpdateResult } from 'typeorm';

// --- MOCK DATA ---
const mockUsuarioId = 1;

const mockProducto: Producto = {
  id: 1,
  nombre: 'Collar',
  codigo: 'A123',
  precio: 100,
  stock: 10,
  linea: 'Premium',
  fotoUrl: 'http://foto.com/img.png',
  fechaCreacion: new Date(),
  descripcion: 'Collar de perro',
  // Simulación de otras propiedades de la entidad
} as Producto;

const mockCreateDto: CreateProductoDto = {
  nombre: 'Collar',
  codigo: 'A123',
  precio: 100,
  stock: 10,
  linea: 'Premium',
  fotoUrl: 'http://foto.com/img.png',
  descripcion: 'Collar de perro',
};

const mockUpdateDto: UpdateProductoDto = {
  precio: 150,
};

const mockDeleteDto: DeleteProductoDto = {
  id: 1,
  usuarioId: mockUsuarioId,
};

const mockUpdateResult: UpdateResult = {
  affected: 1,
  raw: {},
  generatedMaps: [],
};

// --- MOCK PROVIDERS ---
const mockProductosRepository = {
  create: jest.fn(),
  findAllByUsuarioId: jest.fn(),
  findAllPaginated: jest.fn(),
  findOne: jest.fn(),
  findByCodigo: jest.fn(),
  update: jest.fn(),
  decrementStock: jest.fn(),
  remove: jest.fn(),
};

const mockProductoMapper = {
  toRespuestaFindAllPaginatedProductoDTO: jest.fn(),
};

const mockProductosValidator = {
  validateStock: jest.fn(),
};

const mockHistorialService = {
  create: jest.fn(),
};

// --- TEST SUITE ---
describe('ProductosService', () => {
  let service: ProductosService;
  let repository: IProductosRepository;
  let mapper: ProductoMapper;
  let validator: ProductosValidator;
  let historial: HistorialActividadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        {
          provide: 'IProductosRepository',
          useValue: mockProductosRepository,
        },
        {
          provide: ProductoMapper,
          useValue: mockProductoMapper,
        },
        {
          provide: ProductosValidator,
          useValue: mockProductosValidator,
        },
        {
          provide: HistorialActividadesService,
          useValue: mockHistorialService,
        },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
    repository = module.get<IProductosRepository>('IProductosRepository');
    mapper = module.get<ProductoMapper>(ProductoMapper);
    validator = module.get<ProductosValidator>(ProductosValidator);
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

  // Pruebas para el método create()
  describe('create', () => {
    it('debería crear un producto y registrar historial exitoso', async () => {
      mockProductosRepository.create.mockResolvedValue(mockProducto);
      mockHistorialService.create.mockResolvedValue(undefined);

      const result = await service.create(mockCreateDto, mockUsuarioId);

      expect(mockProductosRepository.create).toHaveBeenCalledWith(
        mockCreateDto,
        mockUsuarioId,
      );
      expect(mockHistorialService.create).toHaveBeenCalledWith({
        usuario: mockUsuarioId,
        accionId: 7,
        estadoId: 1, // Exitoso
      });
      expect(result).toEqual(mockProducto);
    });

    it('debería fallar al crear y registrar historial fallido', async () => {
      const error = new Error('Error de base de datos');
      mockProductosRepository.create.mockRejectedValue(error);
      mockHistorialService.create.mockResolvedValue(undefined);

      await expect(
        service.create(mockCreateDto, mockUsuarioId),
      ).rejects.toThrow(error);

      expect(mockProductosRepository.create).toHaveBeenCalledWith(
        mockCreateDto,
        mockUsuarioId,
      );
      expect(mockHistorialService.create).toHaveBeenCalledWith({
        usuario: mockUsuarioId,
        accionId: 7,
        estadoId: 2, // Fallido
      });
    });
  });

  // Pruebas para el método findAll()
  describe('findAll', () => {
    it('debería retornar un array de productos (con ID de usuario hardcodeado)', async () => {
      const productosArray = [mockProducto];
      mockProductosRepository.findAllByUsuarioId.mockResolvedValue(
        productosArray,
      );

      const result = await service.findAll();

      expect(mockProductosRepository.findAllByUsuarioId).toHaveBeenCalledWith(
        1,
      ); // Temporal hardcodeado
      expect(result).toEqual(productosArray);
    });
  });

  // Pruebas para el método findAllPaginated()
  describe('findAllPaginated', () => {
    const paginatedRepoResult = {
      productos: [mockProducto],
      total: 1,
      page: 1,
      lastPage: 1,
    };
    const mappedResult = {
      productos: [{}], // Simulación de DTOs mapeados
      total: 1,
      page: 1,
      lastPage: 1,
    } as unknown as RespuestaFindAllPaginatedProductoDTO;

    it('debería paginar con valores por defecto (page 1, limit 10)', async () => {
      mockProductosRepository.findAllPaginated.mockResolvedValue(
        paginatedRepoResult,
      );
      mockProductoMapper.toRespuestaFindAllPaginatedProductoDTO.mockReturnValue(
        mappedResult,
      );

      const result = await service.findAllPaginated({});

      expect(mockProductosRepository.findAllPaginated).toHaveBeenCalledWith(
        1,
        10,
      );
      expect(
        mockProductoMapper.toRespuestaFindAllPaginatedProductoDTO,
      ).toHaveBeenCalledWith(paginatedRepoResult);
      expect(result).toEqual(mappedResult);
    });

    it('debería paginar con valores provistos', async () => {
      mockProductosRepository.findAllPaginated.mockResolvedValue(
        paginatedRepoResult,
      );
      mockProductoMapper.toRespuestaFindAllPaginatedProductoDTO.mockReturnValue(
        mappedResult,
      );

      const result = await service.findAllPaginated({ page: 2, limit: 5 });

      expect(mockProductosRepository.findAllPaginated).toHaveBeenCalledWith(
        2,
        5,
      );
    });
  });

  // Pruebas para el método findOne()
  describe('findOne', () => {
    it('debería retornar un producto por ID', async () => {
      mockProductosRepository.findOne.mockResolvedValue(mockProducto);
      const result = await service.findOne(1);
      expect(mockProductosRepository.findOne).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockProducto);
    });
  });

  // Pruebas para el método findOneByCodigo()
  describe('findOneByCodigo', () => {
    it('debería retornar un producto por código', async () => {
      mockProductosRepository.findByCodigo.mockResolvedValue(mockProducto);
      const result = await service.findOneByCodigo('A123');
      expect(mockProductosRepository.findByCodigo).toHaveBeenCalledWith('A123');
      expect(result).toEqual(mockProducto);
    });
  });

  // Pruebas para el método update()
  describe('update', () => {
    it('debería actualizar un producto y registrar historial exitoso', async () => {
      mockProductosRepository.update.mockResolvedValue(mockUpdateResult);
      mockHistorialService.create.mockResolvedValue(undefined);

      const result = await service.update(1, mockUpdateDto, mockUsuarioId);

      expect(mockProductosRepository.update).toHaveBeenCalledWith(
        1,
        mockUpdateDto,
        mockUsuarioId,
      );
      expect(mockHistorialService.create).toHaveBeenCalledWith({
        usuario: mockUsuarioId,
        accionId: 8,
        estadoId: 1, // Exitoso
      });
      expect(result).toEqual(mockUpdateResult);
    });

    it('debería fallar al actualizar y registrar historial fallido', async () => {
      const error = new Error('Error de base de datos');
      mockProductosRepository.update.mockRejectedValue(error);
      mockHistorialService.create.mockResolvedValue(undefined);

      await expect(
        service.update(1, mockUpdateDto, mockUsuarioId),
      ).rejects.toThrow(error);

      expect(mockProductosRepository.update).toHaveBeenCalledWith(
        1,
        mockUpdateDto,
        mockUsuarioId,
      );
      expect(mockHistorialService.create).toHaveBeenCalledWith({
        usuario: mockUsuarioId,
        accionId: 8,
        estadoId: 1, // Fallido
      });
    });
  });

  // Pruebas para el método decrementarStock()
  describe('decrementarStock', () => {
    it('debería validar y decrementar el stock', async () => {
      mockProductosValidator.validateStock.mockReturnValue(undefined); // No lanza error
      mockProductosRepository.decrementStock.mockResolvedValue(
        mockUpdateResult,
      );

      await service.decrementarStock(mockProducto, 5);

      expect(mockProductosValidator.validateStock).toHaveBeenCalledWith(
        mockProducto,
        5,
      );
      expect(mockProductosRepository.decrementStock).toHaveBeenCalledWith(
        mockProducto.id,
        5,
      );
    });

    it('debería fallar si el validador de stock lanza una excepción', async () => {
      const error = new BadRequestException('Stock insuficiente');
      mockProductosValidator.validateStock.mockImplementation(() => {
        throw error;
      });

      await expect(service.decrementarStock(mockProducto, 20)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockProductosValidator.validateStock).toHaveBeenCalledWith(
        mockProducto,
        20,
      );
      // No debe llamar al repositorio si la validación falla
      expect(mockProductosRepository.decrementStock).not.toHaveBeenCalled();
    });
  });

  // Pruebas para el método remove()
  describe('remove', () => {
    it('debería eliminar un producto y registrar historial exitoso', async () => {
      mockProductosRepository.remove.mockResolvedValue(mockUpdateResult);
      mockHistorialService.create.mockResolvedValue(undefined);

      const result = await service.remove(mockDeleteDto);

      expect(mockProductosRepository.remove).toHaveBeenCalledWith(
        mockDeleteDto,
      );
      expect(mockHistorialService.create).toHaveBeenCalledWith({
        usuario: mockDeleteDto.usuarioId,
        accionId: 9,
        estadoId: 1, // Exitoso
      });
      expect(result).toEqual(mockUpdateResult);
    });

    it('debería fallar al eliminar y registrar historial fallido', async () => {
      const error = new Error('Error de base de datos');
      mockProductosRepository.remove.mockRejectedValue(error);
      mockHistorialService.create.mockResolvedValue(undefined);

      await expect(service.remove(mockDeleteDto)).rejects.toThrow(error);

      expect(mockProductosRepository.remove).toHaveBeenCalledWith(
        mockDeleteDto,
      );
      expect(mockHistorialService.create).toHaveBeenCalledWith({
        usuario: mockDeleteDto.usuarioId,
        accionId: 9,
        estadoId: 2, // Fallido
      });
    });
  });
});
