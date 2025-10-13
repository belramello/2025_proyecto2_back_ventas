// src/modules/productos/repository/producto.repository.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductosRepository } from './producto.repository';
import { Producto } from '../entities/producto.entity';
import { Repository, UpdateResult } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { FindOneProductoDto } from '../dto/findOne-producto.dto';
import { DeleteProductoDto } from '../dto/delete-producto.dto';

// Mock del Repository de TypeORM
const mockTypeOrmRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

// Datos de prueba
const productoData: CreateProductoDto = {
    nombre: 'Juguete', codigo: 'JUG1', precio: 10, marca: 'Marca',
    stock: 5, linea: 'Linea', fotoUrl: 'url', descripcion: 'desc', usuarioId: 1
};
const mockProducto: Producto = { id: 1, ...productoData, fechaCreacion: new Date(), fechaActualizacion: null, fechaEliminacion: null };
const errorSimulado = new Error('Database connection failed');

describe('ProductosRepository', () => {
  let repository: ProductosRepository;
  let typeormRepository: Repository<Producto>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosRepository,
        {
          provide: getRepositoryToken(Producto),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<ProductosRepository>(ProductosRepository);
    typeormRepository = module.get<Repository<Producto>>(getRepositoryToken(Producto));

    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  // ────────────────────────────────
  // 📦 create
  // ────────────────────────────────
  describe('create', () => {
    it('debe guardar el producto y devolver la entidad', async () => {
      mockTypeOrmRepository.create.mockReturnValue(mockProducto);
      mockTypeOrmRepository.save.mockResolvedValue(mockProducto);
      
      const result = await repository.create(productoData);

      expect(typeormRepository.create).toHaveBeenCalledWith(expect.objectContaining({ ...productoData }));
      expect(typeormRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProducto);
    });

    it('debe lanzar InternalServerErrorException en caso de error de guardado', async () => {
      mockTypeOrmRepository.save.mockRejectedValue(errorSimulado);

      await expect(repository.create(productoData)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ────────────────────────────────
  // 🔍 findAllByUsuarioId
  // ────────────────────────────────
  describe('findAllByUsuarioId', () => {
    it('debe devolver un array de productos', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([mockProducto]);

      const result = await repository.findAllByUsuarioId(1);

      expect(typeormRepository.find).toHaveBeenCalledWith({
        where: { usuarioId: 1 },
        order: { fechaCreacion: "DESC" },
      });
      expect(result).toEqual([mockProducto]);
    });

    it('debe lanzar InternalServerErrorException en caso de error de búsqueda', async () => {
      mockTypeOrmRepository.find.mockRejectedValue(errorSimulado);

      await expect(repository.findAllByUsuarioId(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ────────────────────────────────
  // 🔎 findOne
  // ────────────────────────────────
  describe('findOne', () => {
    const findDto: FindOneProductoDto = { id: 1 };
    
    it('debe devolver el producto si existe', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockProducto);

      const result = await repository.findOne(findDto);

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: findDto.id },
      });
      expect(result).toEqual(mockProducto);
    });

    it('debe lanzar InternalServerErrorException si NO encuentra el producto (producto = null)', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      await expect(repository.findOne(findDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(repository.findOne(findDto)).rejects.toThrow(
        `No se encontró el producto con ID ${findDto.id}`,
      );
    });
    
    // Cubriendo el catch: cuando el error ocurre dentro del ORM (no solo si es null)
    it('debe lanzar InternalServerErrorException en caso de error de consulta', async () => {
      mockTypeOrmRepository.findOne.mockRejectedValue(errorSimulado);

      await expect(repository.findOne(findDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ────────────────────────────────
  // 🛠️ update
  // ────────────────────────────────
  describe('update', () => {
    const updateResult: UpdateResult = { raw: {}, generatedMaps: [], affected: 1 };
    it('debe llamar a update con fechaActualizacion y devolver el resultado', async () => {
      mockTypeOrmRepository.update.mockResolvedValue(updateResult);

      const result = await repository.update(1, { precio: 15 });

      expect(typeormRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
        precio: 15,
        fechaActualizacion: expect.any(Date),
      }));
      expect(result).toEqual(updateResult);
    });

    it('debe lanzar InternalServerErrorException en caso de error de actualización', async () => {
      mockTypeOrmRepository.update.mockRejectedValue(errorSimulado);

      await expect(repository.update(1, { precio: 15 })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ────────────────────────────────
  // 🗑️ remove (Soft Delete)
  // ────────────────────────────────
  describe('remove', () => {
    const deleteDto: DeleteProductoDto = { id: 1 };
    const updateResult: UpdateResult = { raw: {}, generatedMaps: [], affected: 1 };

    it('debe llamar a update con fechaEliminacion para soft delete', async () => {
      mockTypeOrmRepository.update.mockResolvedValue(updateResult);

      const result = await repository.remove(deleteDto);

      expect(typeormRepository.update).toHaveBeenCalledWith(deleteDto.id, {
        fechaEliminacion: expect.any(Date),
      });
      expect(result).toEqual(updateResult);
    });

    it('debe lanzar InternalServerErrorException en caso de error de soft delete', async () => {
      mockTypeOrmRepository.update.mockRejectedValue(errorSimulado);

      await expect(repository.remove(deleteDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});