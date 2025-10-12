// src/modules/productos/productos.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Producto } from './entities/producto.entity';
import { DeleteProductoDto } from './dto/delete-producto.dto';

// Mock del servicio para aislar el controlador
const mockProductosService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Datos base de un producto para usar en los mocks
const productoBase: Omit<Producto, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'fechaEliminacion'> = {
  nombre: 'Collar para perro',
  codigo: 'ABC0123',
  precio: 2499.99,
  marca: 'Pedigree',
  stock: 30,
  linea: 'Premium',
  fotoUrl: 'https://example.com/collar.jpg',
  descripcion: 'Collar resistente y ajustable.',
  usuarioId: 1,
};

describe('ProductosController', () => {
  let controller: ProductosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductosController],
      providers: [
        {
          provide: ProductosService,
          useValue: mockProductosService, // Usamos nuestro mock
        },
      ],
    }).compile();

    controller = module.get<ProductosController>(ProductosController);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpiamos los mocks después de cada prueba
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  // ────────────────────────────────
  // 📦 CREATE
  // ────────────────────────────────
  describe('create', () => {
    it('debe llamar a productosService.create con el DTO correcto', async () => {
      const createDto: CreateProductoDto = {
        ...productoBase,
        fechaCreacion: new Date('2025-10-11T00:00:00.000Z'), // Opcional en el DTO, pero lo incluimos por claridad
      };

      const expectedResult: Producto = {
        id: 1,
        ...productoBase,
        fechaCreacion: new Date(),
        fechaActualizacion: null,
        fechaEliminacion: null,
      };
      mockProductosService.create.mockResolvedValue(expectedResult);

      await controller.create(createDto);

      // Verificamos que se haya llamado con el DTO (sin importar si la fechaCreacion se omitió o no)
      expect(mockProductosService.create).toHaveBeenCalledWith(createDto);
    });
  });

  // ────────────────────────────────
  // 🔍 FIND ALL
  // ────────────────────────────────
  describe('findAll', () => {
    it('debe llamar a productosService.findAll y retornar la lista de productos', async () => {
      const expectedResult: Producto[] = [
        {
          id: 1,
          ...productoBase,
          fechaCreacion: new Date(),
          fechaActualizacion: null,
          fechaEliminacion: null,
        },
      ];
      mockProductosService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(mockProductosService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  // ────────────────────────────────
  // 🔎 FIND ONE
  // ────────────────────────────────
  describe('findOne', () => {
    it('debe llamar a productosService.findOne y convertir el parámetro ID a número', async () => {
      const id = '10';
      const expectedResult: Producto = {
        id: 10,
        ...productoBase,
        fechaCreacion: new Date(),
        fechaActualizacion: null,
        fechaEliminacion: null,
      };
      mockProductosService.findOne.mockResolvedValue(expectedResult);

      await controller.findOne(id);

      expect(mockProductosService.findOne).toHaveBeenCalledWith(10); // Verifica la conversión a +id
    });
  });

  // ────────────────────────────────
  // 🛠️ UPDATE
  // ────────────────────────────────
  describe('update', () => {
    it('debe llamar a productosService.update y convertir el ID y pasar el DTO', async () => {
      const id = '25';
      const updateDto: UpdateProductoDto = { precio: 550.50, stock: 10 };
      const expectedResult = {
        /* ... */
        id: 25,
        precio: 550.50,
        stock: 10,
        fechaActualizacion: new Date(),
      };
      mockProductosService.update.mockResolvedValue(expectedResult);

      await controller.update(id, updateDto);

      expect(mockProductosService.update).toHaveBeenCalledWith(25, updateDto);
    });
  });

  // ────────────────────────────────
  // 🗑️ REMOVE (SOFT DELETE)
  // ────────────────────────────────
  describe('remove', () => {
    it('debe llamar a productosService.remove con el DTO correcto para soft delete', async () => {
      const id = '5';
      // Utilizamos DeleteProductoDto
      const deleteDto: DeleteProductoDto = { id: 5 };
      mockProductosService.remove.mockResolvedValue(undefined);

      await controller.remove(id);

      // Verifica que se haya llamado con el objeto { id: number }
      expect(mockProductosService.remove).toHaveBeenCalledWith(deleteDto);
    });
  });
});