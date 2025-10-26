/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import {
  AuthGuard,
  RequestWithUsuario,
} from '../../middlewares/auth.middleware';
import { PermisosGuard } from '../../common/guards/permisos.guard';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { DeleteProductoDto } from './dto/delete-producto.dto';
import { PaginationDto } from '../ventas/dto/pagination.dto';
import { Producto } from './entities/producto.entity';
import { UpdateResult } from 'typeorm';

// --- MOCK DATA ---
const mockUsuarioId = 1;

// Simulación del objeto Request que inyecta el AuthGuard
const mockRequest = {
  usuario: {
    id: mockUsuarioId,
    // ... otras propiedades de usuario si fueran necesarias
  },
} as unknown as RequestWithUsuario;

const mockProducto: Producto = {
  id: 1,
  nombre: 'Producto Test',
  codigo: 'A123',
  precio: 100,
  stock: 10,
  linea: 'Test Linea',
  fotoUrl: 'http://test.com/img.png',
  descripcion: 'Test Desc',
  fechaCreacion: new Date(),
} as Producto;

const mockCreateDto: CreateProductoDto = {
  nombre: 'Producto Test',
  codigo: 'A123',
  precio: 100,
  stock: 10,
  linea: 'Test Linea',
  fotoUrl: 'http://test.com/img.png',
  descripcion: 'Test Desc',
};

const mockUpdateDto: UpdateProductoDto = {
  nombre: 'Producto Actualizado',
};

// --- MOCK PROVIDERS ---
const mockProductosService = {
  create: jest.fn(),
  findAllPaginated: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  findOneByCodigo: jest.fn(),
  remove: jest.fn(),
};

// Mock simple para un guardia que siempre permite el acceso
const mockGuard = { canActivate: jest.fn(() => true) };

// --- TEST SUITE ---
describe('ProductosController', () => {
  let controller: ProductosController;
  let service: typeof mockProductosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductosController],
      providers: [
        {
          provide: ProductosService,
          useValue: mockProductosService,
        },
      ],
    })
      // Sobreescribimos los guardias globales del controlador
      .overrideGuard(AuthGuard)
      .useValue(mockGuard)
      .overrideGuard(PermisosGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<ProductosController>(ProductosController);
    service = module.get(ProductosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  // Pruebas para el método create()
  describe('create', () => {
    it('debería crear un producto y pasar el ID de usuario del request', async () => {
      service.create.mockResolvedValue(mockProducto);

      const result = await controller.create(mockCreateDto, mockRequest);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(
        mockCreateDto,
        expect.objectContaining({ id: mockUsuarioId }),
      );
      expect(result).toEqual(mockProducto);
    });
  });

  // Pruebas para el método findAll()
  describe('findAll', () => {
    it('debería llamar a findAllPaginated con el DTO de paginación', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const expectedResult = { productos: [], total: 0, page: 1, lastPage: 1 };
      service.findAllPaginated.mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto);

      expect(service.findAllPaginated).toHaveBeenCalledTimes(1);
      expect(service.findAllPaginated).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(expectedResult);
    });
  });

  // Pruebas para el método findOne()
  describe('findOne', () => {
    it('debería llamar a findOne con el ID', async () => {
      service.findOne.mockResolvedValue(mockProducto);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProducto);
    });
  });

  // Pruebas para el método update()
  describe('update', () => {
    it('debería actualizar un producto y pasar el ID de usuario', async () => {
      const updateResult = { affected: 1 } as UpdateResult;
      service.update.mockResolvedValue(updateResult);

      const result = await controller.update(
        '1', // El Param ID viene como string y lo pasamos como string
        mockUpdateDto,
        mockRequest,
      );

      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith(
        '1', // Esperamos el string original del @Param
        mockUpdateDto,
        expect.objectContaining({ id: mockUsuarioId }),
      );
      expect(result).toEqual(updateResult);
    });
  });

  // Pruebas para el método findOneByCodigo()
  describe('findOneByCodigo', () => {
    it('debería llamar a findOneByCodigo con el código', async () => {
      service.findOneByCodigo.mockResolvedValue(mockProducto);

      const result = await controller.findOneByCodigo('A123');

      expect(service.findOneByCodigo).toHaveBeenCalledTimes(1);
      expect(service.findOneByCodigo).toHaveBeenCalledWith('A123');
      expect(result).toEqual(mockProducto);
    });
  });

  // Pruebas para el método remove()
  describe('remove', () => {
    it('debería construir el DeleteProductoDto y llamar a remove', async () => {
      const deleteResult = { affected: 1 } as UpdateResult;
      service.remove.mockResolvedValue(deleteResult);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await controller.remove('1', mockRequest); // El Param ID viene como string

      // El DTO esperado que el controlador debe construir
      const expectedDto: DeleteProductoDto = {
        id: 1, // Convertido a número
        usuarioId: mockUsuarioId,
      };

      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(service.remove).toHaveBeenCalledWith(expectedDto);
      expect(result).toEqual(deleteResult);
    });
  });
});
