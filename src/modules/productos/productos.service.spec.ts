// src/modules/productos/productos.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { DeleteProductoDto } from './dto/delete-producto.dto';

// Mock del Repositorio. Aquí simulamos el comportamiento del IProductosRepository.
const mockProductosRepository = {
  create: jest.fn(),
  findAllByUsuarioId: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ProductosService', () => {
  let service: ProductosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        {
          // Token de inyección real
          provide: 'IProductosRepository',
          useValue: mockProductosRepository,
        },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpiamos los mocks después de cada prueba
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ────────────────────────────────
  // 📦 CREATE
  // ────────────────────────────────
  it('el método create debe llamar a repository.create con el DTO completo', async () => {
    const createDto: CreateProductoDto = {
      nombre: 'Teclado Mecánico',
      codigo: 'KB001',
      precio: 80.5,
      marca: 'LogiTech',
      stock: 50,
      linea: 'Gamer',
      fotoUrl: 'http://foo.bar/teclado.jpg',
      descripcion: 'Teclado RGB y switches red.',
      usuarioId: 1,
    };
    await service.create(createDto);
    expect(mockProductosRepository.create).toHaveBeenCalledWith(createDto);
  });

  // ────────────────────────────────
  // 🔍 FIND ALL
  // ────────────────────────────────
  it('el método findAll debe llamar a repository.findAllByUsuarioId con el ID temporal (1)', async () => {
    await service.findAll();
    // Verifica que use el ID 1 como está definido temporalmente en tu código
    expect(mockProductosRepository.findAllByUsuarioId).toHaveBeenCalledWith(1);
  });

  // ────────────────────────────────
  // 🔎 FIND ONE
  // ────────────────────────────────
  it('el método findOne debe llamar a repository.findOne con el objeto de búsqueda { id }', async () => {
    const id = 5;
    await service.findOne(id);
    expect(mockProductosRepository.findOne).toHaveBeenCalledWith({ id: 5 });
  });

  // ────────────────────────────────
  // 🛠️ UPDATE
  // ────────────────────────────────
  it('el método update debe llamar a repository.update con el id y el DTO', async () => {
    const id = 15;
    const updateDto: UpdateProductoDto = { stock: 5, precio: 99.99 };
    await service.update(id, updateDto);
    expect(mockProductosRepository.update).toHaveBeenCalledWith(15, updateDto);
  });

  // ────────────────────────────────
  // 🗑️ REMOVE (SOFT DELETE)
  // ────────────────────────────────
  it('el método remove debe llamar a repository.remove con el DTO de borrado', async () => {
    const deleteDto: DeleteProductoDto = { id: 7 };
    await service.remove(deleteDto);
    expect(mockProductosRepository.remove).toHaveBeenCalledWith(deleteDto);
  });
});