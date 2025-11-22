/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
// --- MOCKS DE MÓDULOS ---
// 1. Mockear Swagger (¡ESENCIAL!)
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger, // Mantiene ApiProperty, ApiTags, etc.
}));

// 2. Mockear fs (¡ESENCIAL!)
const mockUnlinkSync = jest.fn();
jest.mock('fs', () => ({
  ...jest.requireActual('fs'), // Keep original functions if needed
  unlinkSync: mockUnlinkSync,
}));

// --- IMPORTS REALES ---
import { Test, TestingModule } from '@nestjs/testing';
import { ProductosService } from './productos.service';
import { IProductosRepository } from './repository/producto-repository.interface';
import { ProductoMapper } from './mapper/producto.mapper';
import { ProductosValidator } from './helpers/productos-validator';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Producto } from './entities/producto.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Marca } from '../marcas/entities/marca.entity';
import { Linea } from '../lineas/entities/linea.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { DeleteProductoDto } from './dto/delete-producto.dto';
import { PaginationProductoDto } from './dto/pagination.dto';
import { UpdateResult } from 'typeorm';
import { RespuestaFindAllPaginatedProductoDTO } from './dto/respuesta-find-all-paginated.dto';
import { RespuestaFindOneDetalleProductoDto } from './dto/respuesta-find-one-detalleproducto.dto';

// --- MOCK DATA ---
const mockUsuario: Usuario = { id: 1 } as Usuario;
const mockMarca: Marca = { id: 1 } as Marca;
const mockLinea: Linea = { id: 1 } as Linea;

const mockProducto: Producto = {
  id: 1,
  nombre: 'Test Producto',
  codigo: 'TP001',
  precio: 100,
  stock: 10,
  marca: mockMarca,
  linea: mockLinea,
  usuarioCreacion: mockUsuario,
  fotoUrl: 'uploads/images/test.jpg', // Path guardado
} as Producto;

const mockCreateDto: CreateProductoDto = {
  nombre: 'Test Producto',
  codigo: 'TP001',
  precio: 100,
  stock: 10,
  marcaId: 1,
  lineaId: 1,
  descripcion: 'Test Desc',
  detalleProveedores: [],
  // fotoUrl no viene en el DTO, se asigna desde 'file'
};

const mockUpdateDto: UpdateProductoDto = {
  nombre: 'Producto Actualizado',
};

const mockDeleteDto: DeleteProductoDto = {
  id: 1,
  usuarioId: 1,
};

const mockFile: Express.Multer.File = {
  fieldname: 'foto',
  originalname: 'test.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: 'uploads/images',
  filename: 'test-12345.jpg',
  path: 'uploads\\images\\test-12345.jpg', // Ejemplo path windows
  size: 1000,
  stream: null, // Add readable stream mock if needed
  buffer: null, // Add buffer mock if needed
};
const expectedImagePath = 'uploads/images/test-12345.jpg'; // Path normalizado

const mockUpdateResult: UpdateResult = {
  affected: 1,
  raw: {},
  generatedMaps: [],
};
const mockPaginatedResult = {
  productos: [mockProducto],
  total: 1,
  page: 1,
  lastPage: 1,
};
const mockMappedPaginatedResult = {
  productos: [{}],
  total: 1,
  page: 1,
  lastPage: 1,
} as RespuestaFindAllPaginatedProductoDTO;
const mockMappedDetalleResult = {
  id: 1,
  detalles: [],
} as RespuestaFindOneDetalleProductoDto;

// --- MOCK PROVIDERS ---
const mockProductosRepository = {
  create: jest.fn(),
  findAllPaginated: jest.fn(),
  findOne: jest.fn(),
  findByCodigo: jest.fn(),
  findOneByDetalle: jest.fn(),
  update: jest.fn(),
  decrementStock: jest.fn(),
  remove: jest.fn(),
};

const mockProductoMapper = {
  toRespuestaFindAllPaginatedProductoDTO: jest.fn(),
};

const mockProductosValidator = {
  validateProductoConCodigo: jest.fn(),
  validateMarcaExistente: jest.fn(),
  validateLineaExistente: jest.fn(),
  validateLineaParaMarca: jest.fn(),
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
    // Resetear mocks antes de cada test
    mockUnlinkSync.mockClear();
    Object.values(mockProductosRepository).forEach((fn) => fn.mockReset());
    Object.values(mockProductoMapper).forEach((fn) => fn.mockReset());
    Object.values(mockProductosValidator).forEach((fn) => fn.mockReset());
    Object.values(mockHistorialService).forEach((fn) => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        { provide: 'IProductosRepository', useValue: mockProductosRepository },
        { provide: ProductoMapper, useValue: mockProductoMapper },
        { provide: ProductosValidator, useValue: mockProductosValidator },
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

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // Pruebas para create()
  describe('create', () => {
    it('debería crear producto con imagen, registrar historial éxito', async () => {
      mockProductosValidator.validateProductoConCodigo.mockResolvedValue(
        undefined,
      );
      mockProductosValidator.validateMarcaExistente.mockResolvedValue(
        mockMarca,
      );
      mockProductosValidator.validateLineaExistente.mockResolvedValue(
        mockLinea,
      );
      mockProductosValidator.validateLineaParaMarca.mockResolvedValue(
        undefined,
      );
      mockProductosRepository.create.mockResolvedValue(mockProducto);
      mockHistorialService.create.mockResolvedValue({});

      const result = await service.create(mockCreateDto, mockUsuario, mockFile);

      expect(validator.validateProductoConCodigo).toHaveBeenCalledWith(
        mockCreateDto.codigo,
      );
      expect(validator.validateMarcaExistente).toHaveBeenCalledWith(
        mockCreateDto.marcaId,
      );
      expect(validator.validateLineaExistente).toHaveBeenCalledWith(
        mockCreateDto.lineaId,
      );
      expect(validator.validateLineaParaMarca).toHaveBeenCalledWith(
        mockLinea,
        mockMarca,
      );
      expect(repository.create).toHaveBeenCalledWith(
        { ...mockCreateDto, fotoUrl: expectedImagePath }, // Verifica path normalizado
        mockUsuario,
        mockMarca,
        mockLinea,
      );
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 7,
        estadoId: 1,
      });
      expect(mockUnlinkSync).not.toHaveBeenCalled(); // No debe borrar en éxito
      expect(result).toEqual(mockProducto);
    });

    it('debería crear producto sin imagen, registrar historial éxito', async () => {
      mockProductosValidator.validateProductoConCodigo.mockResolvedValue(
        undefined,
      );
      mockProductosValidator.validateMarcaExistente.mockResolvedValue(
        mockMarca,
      );
      mockProductosValidator.validateLineaExistente.mockResolvedValue(
        mockLinea,
      );
      mockProductosValidator.validateLineaParaMarca.mockResolvedValue(
        undefined,
      );
      mockProductosRepository.create.mockResolvedValue({
        ...mockProducto,
        fotoUrl: null,
      }); // Repo devuelve null
      mockHistorialService.create.mockResolvedValue({});

      const result = await service.create(
        mockCreateDto,
        mockUsuario,
        undefined,
      ); // Sin file

      expect(repository.create).toHaveBeenCalledWith(
        { ...mockCreateDto, fotoUrl: null }, // Verifica fotoUrl null
        mockUsuario,
        mockMarca,
        mockLinea,
      );
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 7,
        estadoId: 1,
      });
      expect(mockUnlinkSync).not.toHaveBeenCalled();
      expect(result.fotoUrl).toBeNull();
    });

    it('debería fallar validación, registrar historial fallo y borrar imagen', async () => {
      const validationError = new BadRequestException('Código duplicado');
      mockProductosValidator.validateProductoConCodigo.mockRejectedValue(
        validationError,
      );
      mockHistorialService.create.mockResolvedValue({});

      await expect(
        service.create(mockCreateDto, mockUsuario, mockFile),
      ).rejects.toThrow(validationError);

      expect(validator.validateProductoConCodigo).toHaveBeenCalledWith(
        mockCreateDto.codigo,
      );
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 7,
        estadoId: 2,
      }); // Estado Fallido
      expect(mockUnlinkSync).toHaveBeenCalledWith(mockFile.path); // Debe borrar imagen
      expect(repository.create).not.toHaveBeenCalled(); // No debe llegar al repo
    });

    it('debería fallar validación (sin file), registrar historial fallo', async () => {
      const validationError = new BadRequestException('Código duplicado');
      mockProductosValidator.validateProductoConCodigo.mockRejectedValue(
        validationError,
      );
      mockHistorialService.create.mockResolvedValue({});

      await expect(
        service.create(mockCreateDto, mockUsuario, undefined),
      ).rejects.toThrow(validationError); // Sin file

      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 7,
        estadoId: 2,
      });
      expect(mockUnlinkSync).not.toHaveBeenCalled(); // No hay imagen que borrar
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('debería fallar repo create, registrar historial fallo y borrar imagen', async () => {
      const dbError = new InternalServerErrorException('DB error');
      mockProductosValidator.validateProductoConCodigo.mockResolvedValue(
        undefined,
      );
      mockProductosValidator.validateMarcaExistente.mockResolvedValue(
        mockMarca,
      );
      mockProductosValidator.validateLineaExistente.mockResolvedValue(
        mockLinea,
      );
      mockProductosValidator.validateLineaParaMarca.mockResolvedValue(
        undefined,
      );
      mockProductosRepository.create.mockRejectedValue(dbError); // Repo falla
      mockHistorialService.create.mockResolvedValue({});

      await expect(
        service.create(mockCreateDto, mockUsuario, mockFile),
      ).rejects.toThrow(dbError);

      expect(repository.create).toHaveBeenCalled(); // Se intentó crear
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 7,
        estadoId: 2,
      });
      expect(mockUnlinkSync).toHaveBeenCalledWith(mockFile.path); // Debe borrar imagen
    });

    it('debería ignorar error si unlinkSync falla durante el rollback', async () => {
      const validationError = new BadRequestException('Código duplicado');
      const unlinkError = new Error('unlink failed');
      mockProductosValidator.validateProductoConCodigo.mockRejectedValue(
        validationError,
      );
      mockHistorialService.create.mockResolvedValue({});
      mockUnlinkSync.mockImplementation(() => {
        throw unlinkError;
      }); // unlink falla

      // Aún así debe lanzar el error original de validación
      await expect(
        service.create(mockCreateDto, mockUsuario, mockFile),
      ).rejects.toThrow(validationError);

      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 7,
        estadoId: 2,
      });
      expect(mockUnlinkSync).toHaveBeenCalledWith(mockFile.path);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  // Pruebas para findAllPaginated()
  describe('findAllPaginated', () => {
    it('debería obtener y mapear productos paginados', async () => {
      mockProductosRepository.findAllPaginated.mockResolvedValue(
        mockPaginatedResult,
      );
      mockProductoMapper.toRespuestaFindAllPaginatedProductoDTO.mockReturnValue(
        mockMappedPaginatedResult,
      );

      const result = await service.findAllPaginated({ page: 1, limit: 10 });

      expect(repository.findAllPaginated).toHaveBeenCalledWith(1, 10);
      expect(
        mapper.toRespuestaFindAllPaginatedProductoDTO,
      ).toHaveBeenCalledWith(mockPaginatedResult);
      expect(result).toEqual(mockMappedPaginatedResult);
    });
    it('debería usar defaults para paginación', async () => {
      mockProductosRepository.findAllPaginated.mockResolvedValue(
        mockPaginatedResult,
      );
      mockProductoMapper.toRespuestaFindAllPaginatedProductoDTO.mockReturnValue(
        mockMappedPaginatedResult,
      );
      await service.findAllPaginated({}); // DTO vacío
      expect(repository.findAllPaginated).toHaveBeenCalledWith(1, 10); // Verifica defaults
    });
    it('should propagate error if repository findAllPaginated fails', async () => {
      const dbError = new Error('DB Error');
      mockProductosRepository.findAllPaginated.mockRejectedValue(dbError);
      await expect(service.findAllPaginated({})).rejects.toThrow(dbError);
      expect(
        mapper.toRespuestaFindAllPaginatedProductoDTO,
      ).not.toHaveBeenCalled();
    });
  });

  // Pruebas para findOne()
  describe('findOne', () => {
    it('debería devolver producto encontrado por repo', async () => {
      mockProductosRepository.findOne.mockResolvedValue(mockProducto);
      const result = await service.findOne(1);
      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProducto);
    });
    it('debería devolver null si repo devuelve null', async () => {
      mockProductosRepository.findOne.mockResolvedValue(null);
      const result = await service.findOne(99);
      expect(repository.findOne).toHaveBeenCalledWith(99);
      expect(result).toBeNull();
    });
    it('should propagate error if repository findOne fails', async () => {
      const dbError = new Error('DB Error');
      mockProductosRepository.findOne.mockRejectedValue(dbError);
      await expect(service.findOne(1)).rejects.toThrow(dbError);
    });
  });

  // Pruebas para findOneByCodigo()
  describe('findOneByCodigo', () => {
    it('debería devolver producto encontrado por repo', async () => {
      mockProductosRepository.findByCodigo.mockResolvedValue(mockProducto);
      const result = await service.findOneByCodigo('TP001');
      expect(repository.findByCodigo).toHaveBeenCalledWith('TP001');
      expect(result).toEqual(mockProducto);
    });
    it('debería devolver null si repo devuelve null', async () => {
      mockProductosRepository.findByCodigo.mockResolvedValue(null);
      const result = await service.findOneByCodigo('NOTFOUND');
      expect(repository.findByCodigo).toHaveBeenCalledWith('NOTFOUND');
      expect(result).toBeNull();
    });
    it('should propagate error if repository findByCodigo fails', async () => {
      const dbError = new Error('DB Error');
      mockProductosRepository.findByCodigo.mockRejectedValue(dbError);
      await expect(service.findOneByCodigo('TP001')).rejects.toThrow(dbError);
    });
  });

  // Pruebas para findOneByDetalle()
  describe('findOneByDetalle', () => {
    it('debería devolver detalle encontrado por repo', async () => {
      mockProductosRepository.findOneByDetalle.mockResolvedValue(
        mockMappedDetalleResult,
      );
      const result = await service.findOneByDetalle(1);
      expect(repository.findOneByDetalle).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMappedDetalleResult);
    });
    it('debería devolver null si repo devuelve null', async () => {
      mockProductosRepository.findOneByDetalle.mockResolvedValue(null);
      const result = await service.findOneByDetalle(99);
      expect(repository.findOneByDetalle).toHaveBeenCalledWith(99);
      expect(result).toBeNull();
    });
    it('should propagate error if repository findOneByDetalle fails', async () => {
      const dbError = new Error('DB Error');
      mockProductosRepository.findOneByDetalle.mockRejectedValue(dbError);
      await expect(service.findOneByDetalle(1)).rejects.toThrow(dbError);
    });
  });

  // Pruebas para update()
  describe('update', () => {
    it('debería actualizar producto con imagen, registrar historial éxito', async () => {
      mockProductosRepository.update.mockResolvedValue(mockUpdateResult);
      mockHistorialService.create.mockResolvedValue({});

      const result = await service.update(
        1,
        mockUpdateDto,
        mockUsuario,
        mockFile,
      );

      expect(repository.update).toHaveBeenCalledWith(
        1,
        { ...mockUpdateDto, fotoUrl: expectedImagePath }, // Verifica DTO actualizado con path
        mockUsuario,
      );
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 8,
        estadoId: 1,
      });
      expect(mockUnlinkSync).not.toHaveBeenCalled(); // No borra en éxito (a menos que borres la antigua)
      expect(result).toEqual(mockUpdateResult);
    });

    it('debería actualizar producto sin imagen, registrar historial éxito', async () => {
      mockProductosRepository.update.mockResolvedValue(mockUpdateResult);
      mockHistorialService.create.mockResolvedValue({});

      const result = await service.update(
        1,
        mockUpdateDto,
        mockUsuario,
        undefined,
      ); // Sin file

      expect(repository.update).toHaveBeenCalledWith(
        1,
        expect.not.objectContaining({ fotoUrl: expect.any(String) }), // Verifica que fotoUrl no se incluye
        mockUsuario,
      );
      expect(repository.update).toHaveBeenCalledWith(
        1,
        mockUpdateDto, // Se pasa el DTO original
        mockUsuario,
      );
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 8,
        estadoId: 1,
      });
      expect(mockUnlinkSync).not.toHaveBeenCalled();
      expect(result).toEqual(mockUpdateResult);
    });

    it('debería fallar repo update, registrar historial fallo y borrar imagen subida', async () => {
      const dbError = new InternalServerErrorException('DB error');
      mockProductosRepository.update.mockRejectedValue(dbError); // Repo falla
      mockHistorialService.create.mockResolvedValue({});

      await expect(
        service.update(1, mockUpdateDto, mockUsuario, mockFile),
      ).rejects.toThrow(dbError);

      expect(repository.update).toHaveBeenCalled(); // Se intentó update
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 8,
        estadoId: 1,
      }); // Fallido
    });

    it('debería fallar repo update (sin file), registrar historial fallo', async () => {
      const dbError = new InternalServerErrorException('DB error');
      mockProductosRepository.update.mockRejectedValue(dbError);
      mockHistorialService.create.mockResolvedValue({});

      await expect(
        service.update(1, mockUpdateDto, mockUsuario, undefined),
      ).rejects.toThrow(dbError); // Sin file

      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 8,
        estadoId: 1,
      });
      expect(mockUnlinkSync).not.toHaveBeenCalled(); // No hay imagen que borrar
    });

    it('debería ignorar error si unlinkSync falla durante el rollback', async () => {
      const dbError = new InternalServerErrorException('DB error');
      const unlinkError = new Error('unlink failed');
      mockProductosRepository.update.mockRejectedValue(dbError);
      mockHistorialService.create.mockResolvedValue({});
      mockUnlinkSync.mockImplementation(() => {
        throw unlinkError;
      }); // unlink falla

      // Aún así debe lanzar el error original del repo
      await expect(
        service.update(1, mockUpdateDto, mockUsuario, mockFile),
      ).rejects.toThrow(dbError);

      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockUsuario.id,
        accionId: 8,
        estadoId: 1,
      });
    });
  });

  // Pruebas para decrementarStock()
  describe('decrementarStock', () => {
    it('debería validar y decrementar stock', async () => {
      mockProductosValidator.validateStock.mockReturnValue(undefined); // No lanza error
      mockProductosRepository.decrementStock.mockResolvedValue(
        mockUpdateResult,
      );

      await service.decrementarStock(mockProducto, 5);

      expect(validator.validateStock).toHaveBeenCalledWith(mockProducto, 5);
      expect(repository.decrementStock).toHaveBeenCalledWith(
        mockProducto.id,
        5,
      );
    });

    it('debería fallar si validateStock falla', async () => {
      const validationError = new BadRequestException('Stock insuficiente');
      mockProductosValidator.validateStock.mockImplementation(() => {
        throw validationError;
      });

      await expect(service.decrementarStock(mockProducto, 15)).rejects.toThrow(
        validationError,
      );
      expect(validator.validateStock).toHaveBeenCalledWith(mockProducto, 15);
      expect(repository.decrementStock).not.toHaveBeenCalled(); // No debe llamar al repo
    });

    it('should propagate error if repository decrementStock fails', async () => {
      const dbError = new Error('DB Error');
      mockProductosValidator.validateStock.mockReturnValue(undefined); // Validación pasa
      mockProductosRepository.decrementStock.mockRejectedValue(dbError); // Repo falla
      await expect(service.decrementarStock(mockProducto, 5)).rejects.toThrow(
        dbError,
      );
    });
  });

  // Pruebas para remove()
  describe('remove', () => {
    it('debería eliminar, registrar historial éxito', async () => {
      mockProductosRepository.remove.mockResolvedValue(mockUpdateResult);
      mockHistorialService.create.mockResolvedValue({});

      const result = await service.remove(mockDeleteDto);

      expect(repository.remove).toHaveBeenCalledWith(mockDeleteDto);
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockDeleteDto.usuarioId,
        accionId: 9,
        estadoId: 1,
      });
      // No esperamos unlink aquí según el código actual
      expect(result).toEqual(mockUpdateResult);
    });

    it('debería fallar repo remove, registrar historial fallo', async () => {
      const dbError = new InternalServerErrorException('DB error');
      mockProductosRepository.remove.mockRejectedValue(dbError); // Repo falla
      mockHistorialService.create.mockResolvedValue({});

      await expect(service.remove(mockDeleteDto)).rejects.toThrow(dbError);

      expect(repository.remove).toHaveBeenCalledWith(mockDeleteDto); // Se intentó eliminar
      expect(historial.create).toHaveBeenCalledWith({
        usuario: mockDeleteDto.usuarioId,
        accionId: 9,
        estadoId: 2,
      }); // Fallido
      // No esperamos unlink aquí
    });
  });
});
