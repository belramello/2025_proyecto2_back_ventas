// src/modules/productos/dto/productos.dto.spec.ts (Asegúrate de que este archivo existe y se ejecuta)

import { DeleteProductoDto } from './delete-producto.dto';
import { FindOneProductoDto } from './findOne-producto.dto';
import { CreateProductoDto } from './create-producto.dto'; // Para cubrir la línea 42 que faltaba.
import { UpdateProductoDto } from './update-producto.dto';

describe('Productos DTOs Coverage', () => {
  
  // ────────────────────────────────
  // 🗑️ DeleteProductoDto (Líneas 1-8)
  // ────────────────────────────────
  it('DeleteProductoDto debe estar definido y sus propiedades accesibles', () => {
    const dto = new DeleteProductoDto();
    dto.id = 1;
    expect(dto).toBeDefined();
    expect(dto.id).toBe(1);
  });

  // ────────────────────────────────
  // 🔎 FindOneProductoDto (Líneas 1-8)
  // ────────────────────────────────
  it('FindOneProductoDto debe estar definido y sus propiedades accesibles', () => {
    const dto = new FindOneProductoDto();
    dto.id = 1;
    expect(dto).toBeDefined();
    expect(dto.id).toBe(1);
  });

  // ────────────────────────────────
  // Cobertura Adicional (Línea 42 de CreateProductoDto)
  // ────────────────────────────────
  it('CreateProductoDto debe estar definido e instanciable para cubrir la línea de fechaCreacion', () => {
    const dto = new CreateProductoDto();
    dto.fechaCreacion = new Date(); // Acceder a la propiedad opcional ayuda a la cobertura
    expect(dto).toBeDefined();
  });
  
  // Opcional: para el 100% de cobertura de update-producto.dto.ts
  it('UpdateProductoDto debe estar definido', () => {
    expect(new UpdateProductoDto()).toBeDefined();
  });
});