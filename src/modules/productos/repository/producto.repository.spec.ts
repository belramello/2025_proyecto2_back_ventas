/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
// --- MOCKS DE MÓDULOS ---

// 1. Mockear typeorm-transactional (¡LA CLAVE!)
// Hacemos que el decorador @Transactional no haga nada.
jest.mock('typeorm-transactional', () => ({
  Transactional:
    () => (target: any, key: string, descriptor: PropertyDescriptor) =>
      descriptor,
  // Mockeamos las otras funciones por si acaso, aunque no deberían llamarse
  initializeTransactionalContext: jest.fn(),
  addTransactionalDataSource: jest.fn(),
}));

// 2. Mockear Swagger (¡ESENCIAL!)
// (Necesario porque CreateProductoDto usa @ApiProperty)
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger, // Mantiene ApiProperty, ApiTags, etc.
  // Mock implementations aren't strictly needed here unless module loading fails
}));

// --- IMPORTS REALES --- (El resto del archivo sigue igual)
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm'; // Removido QueryBuilder ya que no se usa directamente
import { InternalServerErrorException } from '@nestjs/common';
import { ProductosRepository } from './producto.repository';
import { DetalleProveedorProductoService } from '../../../modules/detalleproveedorproducto/detalleproveedorproducto.service';
import { Producto } from '../entities/producto.entity';
import { Usuario } from '../../../modules/usuario/entities/usuario.entity';
import { Marca } from '../../../modules/marcas/entities/marca.entity';
import { Linea } from '../../../modules/lineas/entities/linea.entity';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { DeleteProductoDto } from '../dto/delete-producto.dto';
// Removido CreateDetalleProveedorProductoServiceDto ya que no se usa directamente

// --- MOCK DATA --- (sin cambios)
const mockUsuario = { id: 1 } as Usuario;
const mockMarca = { id: 1 } as Marca;
const mockLinea = { id: 1 } as Linea;

const mockProducto = {
  id: 1,
  nombre: 'Test Producto',
  codigo: 'TP001',
  precio: 100,
  stock: 10,
  marca: mockMarca,
  linea: mockLinea,
  usuarioCreacion: mockUsuario,
  detallesProveedor: [],
} as Producto;

const mockCreateDto: CreateProductoDto = {
  nombre: 'Test Producto',
  codigo: 'TP001',
  precio: 100,
  stock: 10,
  marcaId: 1,
  lineaId: 1,
  fotoUrl: 'http://test.com/img.png',
  descripcion: 'Test Desc',
  detalleProveedores: [
    { codigo: 'PROV1', proveedorId: 1 },
    { codigo: 'PROV2', proveedorId: 2 },
  ],
};

const mockCreateDtoNoDetalles: CreateProductoDto = {
  ...mockCreateDto,
  detalleProveedores: [],
};

const mockUpdateDto: UpdateProductoDto = {
  nombre: 'Producto Actualizado',
  precio: 150,
};

const mockDeleteDto: DeleteProductoDto = {
  id: 1,
  usuarioId: 1, // Asumiendo que se usa para algo, aunque no en el repo remove
};

const mockUpdateResult: UpdateResult = {
  affected: 1,
  raw: {},
  generatedMaps: [],
};
const mockUpdateResultFail: UpdateResult = {
  affected: 0,
  raw: {},
  generatedMaps: [],
};

// --- MOCK PROVIDERS --- (sin cambios)
const mockDetalleProveedorService = {
  createDetalles: jest.fn(),
};

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  withDeleted: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  execute: jest.fn(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
};

const mockProductoTypeOrmRepository = {
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

// --- TEST SUITE --- (sin cambios)
describe('ProductosRepository', () => {
  let repository: ProductosRepository;
  let typeormRepo: Repository<Producto>;
  let detalleService: DetalleProveedorProductoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosRepository,
        {
          provide: getRepositoryToken(Producto),
          useValue: mockProductoTypeOrmRepository,
        },
        {
          provide: DetalleProveedorProductoService,
          useValue: mockDetalleProveedorService,
        },
      ],
    }).compile();

    repository = module.get<ProductosRepository>(ProductosRepository);
    typeormRepo = module.get<Repository<Producto>>(
      getRepositoryToken(Producto),
    );
    detalleService = module.get<DetalleProveedorProductoService>(
      DetalleProveedorProductoService,
    );

    Object.values(mockQueryBuilder).forEach((mockFn) => mockFn.mockClear());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });

  // Pruebas para create()
  describe('create', () => {
    beforeEach(() => {
      mockQueryBuilder.getOne.mockResolvedValue(mockProducto);
    });

    it('debería crear producto, detalles y devolver el producto encontrado', async () => {
      mockProductoTypeOrmRepository.create.mockReturnValue(mockProducto);
      mockProductoTypeOrmRepository.save.mockResolvedValue(mockProducto);
      mockDetalleProveedorService.createDetalles.mockResolvedValue([]);

      const result = await repository.create(
        mockCreateDto,
        mockUsuario,
        mockMarca,
        mockLinea,
      );

      expect(typeormRepo.create).toHaveBeenCalledWith({
        ...mockCreateDto,
        usuarioCreacion: mockUsuario,
        marca: mockMarca,
        linea: mockLinea,
      });
      expect(typeormRepo.save).toHaveBeenCalledWith(mockProducto);
      expect(detalleService.createDetalles).toHaveBeenCalledTimes(1);
      expect(detalleService.createDetalles).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            codigo: 'PROV1',
            proveedorId: 1,
            producto: mockProducto,
          }),
          expect.objectContaining({
            codigo: 'PROV2',
            proveedorId: 2,
            producto: mockProducto,
          }),
        ]),
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('producto.id = :id', {
        id: mockProducto.id,
      });
      expect(mockQueryBuilder.getOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProducto);
    });

    it('debería crear producto sin llamar a createDetalles si no hay detalles', async () => {
      mockProductoTypeOrmRepository.create.mockReturnValue(mockProducto);
      mockProductoTypeOrmRepository.save.mockResolvedValue(mockProducto);

      await repository.create(
        mockCreateDtoNoDetalles,
        mockUsuario,
        mockMarca,
        mockLinea,
      );

      expect(typeormRepo.save).toHaveBeenCalled();
      expect(detalleService.createDetalles).not.toHaveBeenCalled();
      expect(mockQueryBuilder.getOne).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar InternalServerErrorException si save falla', async () => {
      const error = new Error('DB Save Error');
      mockProductoTypeOrmRepository.create.mockReturnValue(mockProducto);
      mockProductoTypeOrmRepository.save.mockRejectedValue(error);

      // El error original será atrapado y relanzado como InternalServerErrorException
      await expect(
        repository.create(mockCreateDto, mockUsuario, mockMarca, mockLinea),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        repository.create(mockCreateDto, mockUsuario, mockMarca, mockLinea),
      ).rejects.toThrow(`Error al crear el producto: ${error.message}`); // Verificar mensaje
      expect(detalleService.createDetalles).not.toHaveBeenCalled();
    });

    it('debería lanzar InternalServerErrorException si createDetalles falla', async () => {
      const error = new Error('Detalle Service Error');
      mockProductoTypeOrmRepository.create.mockReturnValue(mockProducto);
      mockProductoTypeOrmRepository.save.mockResolvedValue(mockProducto);
      mockDetalleProveedorService.createDetalles.mockRejectedValue(error);

      await expect(
        repository.create(mockCreateDto, mockUsuario, mockMarca, mockLinea),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        repository.create(mockCreateDto, mockUsuario, mockMarca, mockLinea),
      ).rejects.toThrow(`Error al crear el producto: ${error.message}`); // Verificar mensaje
      expect(mockQueryBuilder.getOne).not.toHaveBeenCalled();
    });

    it('debería lanzar InternalServerErrorException si el findOne final falla', async () => {
      const findOneError = new Error('DB FindOne Error');
      mockProductoTypeOrmRepository.create.mockReturnValue(mockProducto);
      mockProductoTypeOrmRepository.save.mockResolvedValue(mockProducto);
      mockDetalleProveedorService.createDetalles.mockResolvedValue([]);

      // Mockeamos findOne (que usa QB.getOne) para que falle
      mockQueryBuilder.getOne.mockRejectedValue(findOneError);
      const expectedOuterErrorMessage = `Error al crear el producto: Error al buscar el producto con ID ${mockProducto.id}: ${findOneError.message}`;

      await expect(
        repository.create(mockCreateDto, mockUsuario, mockMarca, mockLinea),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        repository.create(mockCreateDto, mockUsuario, mockMarca, mockLinea),
      ).rejects.toThrow(expectedOuterErrorMessage);
    });
  });

  // Pruebas para findOne()
  describe('findOne', () => {
    it('debería encontrar un producto con relaciones usando QueryBuilder', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockProducto);

      const result = await repository.findOne(1);

      expect(typeormRepo.createQueryBuilder).toHaveBeenCalledWith('producto');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'producto.detallesProveedor',
        'detallesProveedor',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'detallesProveedor.proveedor',
        'proveedor',
        '1=1',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'producto.marca',
        'marca',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'producto.linea',
        'linea',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('producto.id = :id', {
        id: 1,
      });
      expect(mockQueryBuilder.withDeleted).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.getOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProducto);
    });

    it('debería devolver null si getOne devuelve null', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      const result = await repository.findOne(99);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('producto.id = :id', {
        id: 99,
      });
      expect(result).toBeNull();
    });

    it('debería lanzar InternalServerErrorException si getOne falla', async () => {
      const error = new Error('DB Error');
      mockQueryBuilder.getOne.mockRejectedValue(error);

      await expect(repository.findOne(1)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(repository.findOne(1)).rejects.toThrow(
        `Error al buscar el producto con ID 1: ${error.message}`,
      );
    });
  });

  // Pruebas para findByCodigo()
  describe('findByCodigo', () => {
    it('debería encontrar un producto por código', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockProducto);

      const result = await repository.findByCodigo('TP001');

      expect(typeormRepo.createQueryBuilder).toHaveBeenCalledWith('producto');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'producto.codigo = :codigo',
        { codigo: 'TP001' },
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProducto);
    });

    it('debería devolver null si getOne devuelve null', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      const result = await repository.findByCodigo('NOTFOUND');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'producto.codigo = :codigo',
        { codigo: 'NOTFOUND' },
      );
      expect(result).toBeNull();
    });

    it('debería lanzar InternalServerErrorException si getOne falla', async () => {
      const error = new Error('DB Error');
      mockQueryBuilder.getOne.mockRejectedValue(error);

      await expect(repository.findByCodigo('TP001')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(repository.findByCodigo('TP001')).rejects.toThrow(
        `Error al buscar el producto con codigo TP001: ${error.message}`,
      );
    });
  });

  // Pruebas para decrementStock()
  describe('decrementStock', () => {
    it('debería decrementar el stock si hay suficiente', async () => {
      mockQueryBuilder.execute.mockResolvedValue(mockUpdateResult); // affected: 1

      const result = await repository.decrementStock(1, 5);

      expect(typeormRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(Producto);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        stock: expect.any(Function),
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'id = :id AND stock >= :cantidad',
        { id: 1, cantidad: 5 },
      );
      expect(mockQueryBuilder.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUpdateResult);
    });

    it('debería lanzar InternalServerErrorException si affected es 0', async () => {
      mockQueryBuilder.execute.mockResolvedValue(mockUpdateResultFail); // affected: 0

      await expect(repository.decrementStock(1, 5)).rejects.toThrow(
        InternalServerErrorException,
      );
      // El mensaje de error ahora viene del catch, no del if
      await expect(repository.decrementStock(1, 5)).rejects.toThrow(
        'Error al actualizar el producto con ID 1: No se pudo descontar stock: producto no existe o stock insuficiente.',
      );
    });

    it('debería lanzar InternalServerErrorException si execute falla', async () => {
      const error = new Error('DB Error');
      mockQueryBuilder.execute.mockRejectedValue(error);

      await expect(repository.decrementStock(1, 5)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(repository.decrementStock(1, 5)).rejects.toThrow(
        `Error al actualizar el producto con ID 1: ${error.message}`,
      );
    });
  });

  // Pruebas para update()
  describe('update', () => {
    it('debería actualizar el producto', async () => {
      mockProductoTypeOrmRepository.update.mockResolvedValue(mockUpdateResult);

      const result = await repository.update(1, mockUpdateDto, mockUsuario);

      expect(typeormRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          ...mockUpdateDto,
          fechaActualizacion: expect.any(Date),
          usuarioModificacion: mockUsuario,
        }),
      );
      expect(result).toEqual(mockUpdateResult);
    });

    it('debería lanzar InternalServerErrorException si update falla', async () => {
      const error = new Error('DB Error');
      mockProductoTypeOrmRepository.update.mockRejectedValue(error);

      await expect(
        repository.update(1, mockUpdateDto, mockUsuario),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        repository.update(1, mockUpdateDto, mockUsuario),
      ).rejects.toThrow(
        `Error al actualizar el producto con ID 1: ${error.message}`,
      );
    });
  });

  // Pruebas para remove()
  describe('remove', () => {
    it('debería hacer soft delete del producto', async () => {
      mockProductoTypeOrmRepository.softDelete.mockResolvedValue(
        mockUpdateResult,
      );

      const result = await repository.remove(mockDeleteDto);

      expect(typeormRepo.softDelete).toHaveBeenCalledWith(mockDeleteDto.id);
      expect(result).toEqual(mockUpdateResult);
    });

    it('debería lanzar InternalServerErrorException si softDelete falla', async () => {
      const error = new Error('DB Error');
      mockProductoTypeOrmRepository.softDelete.mockRejectedValue(error);

      await expect(repository.remove(mockDeleteDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(repository.remove(mockDeleteDto)).rejects.toThrow(
        `Error al eliminar (soft delete) el producto con ID ${mockDeleteDto.id}: ${error.message}`,
      );
    });
  });

  // Pruebas para findAllPaginated()
  describe('findAllPaginated', () => {
    it('debería devolver productos paginados y calcular lastPage', async () => {
      const page = 1;
      const limit = 10;
      const total = 25;
      const productos = [mockProducto, mockProducto];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([productos, total]);

      const result = await repository.findAllPaginated(page, limit);

      expect(typeormRepo.createQueryBuilder).toHaveBeenCalledWith('producto');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'producto.marca',
        'marca',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'producto.linea',
        'linea',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'producto.detallesProveedor',
        'detallesProveedor',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'detallesProveedor.proveedor',
        'proveedor',
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'producto.nombre',
        'ASC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(limit);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        productos,
        total,
        page,
        lastPage: 3,
      });
    });

    it('debería calcular lastPage correctamente para la última página', async () => {
      const page = 3;
      const limit = 10;
      const total = 25;
      const productos = [mockProducto];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([productos, total]);

      const result = await repository.findAllPaginated(page, limit);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
      expect(result.lastPage).toBe(3);
    });

    it('debería lanzar InternalServerErrorException si getManyAndCount falla', async () => {
      const error = new Error('DB Error');
      mockQueryBuilder.getManyAndCount.mockRejectedValue(error);

      await expect(repository.findAllPaginated(1, 10)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(repository.findAllPaginated(1, 10)).rejects.toThrow(
        `Error al encontrar los productos paginados: ${error.message}`,
      );
    });
  });
});
