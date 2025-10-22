import { Test, TestingModule } from '@nestjs/testing';
import { ProductosService } from './productos.service';
import { IProductosRepository } from './repository/producto-repository.interface';
import { ProductoMapper } from './mapper/producto.mapper';
import { ProductosValidator } from './helpers/productos-validator';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { PaginationProductoDto } from './dto/pagination.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { DeleteProductoDto } from './dto/delete-producto.dto';
import { RespuestaFindAllPaginatedProductoDTO } from './dto/respuesta-find-all-paginated.dto';
import { BadRequestException } from '@nestjs/common';
import { UpdateResult } from 'typeorm';

// --- Mocks y Datos de Prueba ---

// 1. Datos falsos (stubs)
const mockProducto: Producto = {
  id: 1,
  nombre: 'Collar para perro',
  codigo: 'ABC0123',
  precio: 2500,
  marca: 'Pedigree',
  stock: 30,
  linea: 'Premium',
  fotoUrl: 'https://example.com/foto.jpg',
  descripcion: 'Collar resistente',
  usuarioId: 1,
  fechaCreacion: new Date(),
  detalleVentas: [],
  fechaActualizacion: new Date(),
  fechaEliminacion: new Date(),
};

const mockUpdateResult: UpdateResult = {
  affected: 1,
  raw: [],
  generatedMaps: [],
};

// 2. Tipos para los Mocks
type MockRepository = Partial<Record<keyof IProductosRepository, jest.Mock>>;
type MockMapper = Partial<Record<keyof ProductoMapper, jest.Mock>>;
type MockValidator = Partial<Record<keyof ProductosValidator, jest.Mock>>;

// 3. Fábricas de Mocks
const createMockRepository = (): MockRepository => ({
  create: jest.fn(),
  findAllByUsuarioId: jest.fn(),
  findAllPaginated: jest.fn(),
  findOne: jest.fn(),
  findByCodigo: jest.fn(),
  update: jest.fn(),
  decrementStock: jest.fn(),
  remove: jest.fn(),
});

const createMockMapper = (): MockMapper => ({
  toRespuestaFindAllPaginatedProductoDTO: jest.fn(),
  // Añadimos los otros métodos por si los necesitaras, aunque no los usa este servicio
  toRespuestaCreateProducto: jest.fn(),
  toRespuestaFinalFindOneDto: jest.fn(),
  toRespuestaFindAllProductosDTO: jest.fn(),
});

const createMockValidator = (): MockValidator => ({
  validateStock: jest.fn(),
});

// --- Suite de Pruebas ---

describe('ProductosService', () => {
  let service: ProductosService;
  let repository: MockRepository;
  let mapper: MockMapper;
  let validator: MockValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // 1. El servicio real
        ProductosService,
        // 2. Mocks de sus dependencias
        {
          provide: 'IProductosRepository', // ¡Usar el token de inyección!
          useValue: createMockRepository(),
        },
        {
          provide: ProductoMapper,
          useValue: createMockMapper(),
        },
        {
          provide: ProductosValidator,
          useValue: createMockValidator(),
        },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
    repository = module.get<MockRepository>('IProductosRepository');
    mapper = module.get<MockMapper>(ProductoMapper);
    validator = module.get<MockValidator>(ProductosValidator);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // --- Pruebas para create() ---
  describe('create', () => {
    it('debería crear un producto', async () => {
      const createDto: CreateProductoDto = { ...mockProducto };
      repository.create?.mockResolvedValue(mockProducto);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockProducto);
    });
  });

  // --- Pruebas para findAll() ---
  describe('findAll', () => {
    it('debería retornar todos los productos para el usuario (ID 1 temporal)', async () => {
      const mockProductosArray = [mockProducto];
      repository.findAllByUsuarioId?.mockResolvedValue(mockProductosArray);

      const result = await service.findAll();

      // Verifica que se llama con el ID 1 hardcodeado
      expect(repository.findAllByUsuarioId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProductosArray);
    });
  });

  // --- Pruebas para findAllPaginated() ---
  describe('findAllPaginated', () => {
    it('debería retornar productos paginados y mapeados', async () => {
      const paginationDto: PaginationProductoDto = { page: 1, limit: 5 };
      const repoResult = {
        productos: [mockProducto],
        total: 1,
        page: 1,
        lastPage: 1,
      };
      const mapperResult: RespuestaFindAllPaginatedProductoDTO = {
        productos: [], // El mapper los transformaría
        total: 1,
        page: 1,
        lastPage: 1,
      };

      repository.findAllPaginated?.mockResolvedValue(repoResult);
      mapper.toRespuestaFindAllPaginatedProductoDTO?.mockReturnValue(
        mapperResult,
      );

      const result = await service.findAllPaginated(paginationDto);

      expect(repository.findAllPaginated).toHaveBeenCalledWith(
        paginationDto.page,
        paginationDto.limit,
      );
      expect(
        mapper.toRespuestaFindAllPaginatedProductoDTO,
      ).toHaveBeenCalledWith(repoResult);
      expect(result).toEqual(mapperResult);
    });

    it('debería usar valores por defecto para paginación (page 1, limit 10)', async () => {
      const paginationDto: PaginationProductoDto = {}; // Sin page y limit
      const repoResult = {
        productos: [],
        total: 0,
        page: 1,
        lastPage: 1,
      };
      const mapperResult: RespuestaFindAllPaginatedProductoDTO = {
        productos: [],
        total: 0,
        page: 1,
        lastPage: 1,
      };

      repository.findAllPaginated?.mockResolvedValue(repoResult);
      mapper.toRespuestaFindAllPaginatedProductoDTO?.mockReturnValue(
        mapperResult,
      );

      await service.findAllPaginated(paginationDto);

      // Verifica que se usen los defaults 10 (limit) y 1 (page)
      expect(repository.findAllPaginated).toHaveBeenCalledWith(1, 10);
    });
  });

  // --- Pruebas para findOne() ---
  describe('findOne', () => {
    it('debería retornar un producto por ID', async () => {
      const id = 1;
      repository.findOne?.mockResolvedValue(mockProducto);

      const result = await service.findOne(id);

      expect(repository.findOne).toHaveBeenCalledWith({ id });
      expect(result).toEqual(mockProducto);
    });

    it('debería retornar null si el producto no existe', async () => {
      const id = 99;
      repository.findOne?.mockResolvedValue(null);

      const result = await service.findOne(id);

      expect(repository.findOne).toHaveBeenCalledWith({ id: 99 });
      expect(result).toBeNull();
    });
  });

  // --- Pruebas para findOneByCodigo() ---
  describe('findOneByCodigo', () => {
    it('debería retornar un producto por código', async () => {
      const codigo = 'ABC0123';
      repository.findByCodigo?.mockResolvedValue(mockProducto);

      const result = await service.findOneByCodigo(codigo);

      expect(repository.findByCodigo).toHaveBeenCalledWith(codigo);
      expect(result).toEqual(mockProducto);
    });
  });

  // --- Pruebas para update() ---
  describe('update', () => {
    it('debería actualizar un producto', async () => {
      const id = 1;
      const updateDto: UpdateProductoDto = { nombre: 'Nuevo Nombre' };
      repository.update?.mockResolvedValue(mockUpdateResult);

      const result = await service.update(id, updateDto);

      expect(repository.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(mockUpdateResult);
    });
  });

  // --- Pruebas para decrementarStock() ---
  describe('decrementarStock', () => {
    it('debería llamar al validador y luego decrementar el stock', async () => {
      const cantidad = 5;
      // Mock para que la validación pase (no retorna nada)
      validator.validateStock?.mockImplementation(() => {});
      repository.decrementStock?.mockResolvedValue(mockUpdateResult);

      await service.decrementarStock(mockProducto, cantidad);

      // Verifica que el validador fue llamado PRIMERO
      expect(validator.validateStock).toHaveBeenCalledWith(
        mockProducto,
        cantidad,
      );
      // Verifica que el repositorio fue llamado DESPUÉS
      expect(repository.decrementStock).toHaveBeenCalledWith(
        mockProducto.id,
        cantidad,
      );
    });

    it('debería lanzar BadRequestException si el validador falla', async () => {
      const cantidad = 99; // Más que el stock (30)
      // Mock para que la validación falle
      validator.validateStock?.mockImplementation(() => {
        throw new BadRequestException('Stock insuficiente');
      });

      // Verificamos que se lanza la excepción
      await expect(
        service.decrementarStock(mockProducto, cantidad),
      ).rejects.toThrow(BadRequestException);

      // Verifica que el validador fue llamado
      expect(validator.validateStock).toHaveBeenCalledWith(
        mockProducto,
        cantidad,
      );
      // ¡MUY IMPORTANTE! Verifica que el repositorio NUNCA fue llamado
      expect(repository.decrementStock).not.toHaveBeenCalled();
    });
  });

  // --- Pruebas para remove() ---
  describe('remove', () => {
    it('debería eliminar (soft delete) un producto', async () => {
      const deleteDto: DeleteProductoDto = { id: 1 };
      repository.remove?.mockResolvedValue(mockUpdateResult);

      const result = await service.remove(deleteDto);

      expect(repository.remove).toHaveBeenCalledWith(deleteDto);
      expect(result).toEqual(mockUpdateResult);
    });
  });
});
