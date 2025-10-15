import { UpdateResult, DeleteResult } from 'typeorm';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { Producto } from '../entities/producto.entity';
import { FindOneProductoDto } from '../dto/findOne-producto.dto';
import { DeleteProductoDto } from '../dto/delete-producto.dto';

export interface IProductosRepository {
  create(data: CreateProductoDto): Promise<Producto>;
  findAllByUsuarioId(usuarioId: number): Promise<Producto[]>;
  findOne(data: FindOneProductoDto): Promise<Producto>;
  findOneByCodigo(codigo: string): Promise<Producto | null>;
  update(id: number, data: UpdateProductoDto): Promise<UpdateResult>;
  remove(id: DeleteProductoDto): Promise<UpdateResult>; // devolvemos UpdateResult del soft delete
}
