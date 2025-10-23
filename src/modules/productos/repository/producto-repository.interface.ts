import { UpdateResult } from 'typeorm';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { Producto } from '../entities/producto.entity';
import { DeleteProductoDto } from '../dto/delete-producto.dto';

export interface IProductosRepository {
  create(data: CreateProductoDto): Promise<Producto>;
  findAllByUsuarioId(usuarioId: number): Promise<Producto[]>;
  findOne(id: number): Promise<Producto | null>;
  findByCodigo(codigo: string): Promise<Producto | null>;
  decrementStock(id: number, cantidad: number): Promise<UpdateResult>;
  update(id: number, data: UpdateProductoDto): Promise<UpdateResult>;
  remove(id: DeleteProductoDto): Promise<UpdateResult>; // devolvemos UpdateResult del soft delete
  findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{
    productos: Producto[];
    total: number;
    page: number;
    lastPage: number;
  }>;
}
