import { UpdateResult } from 'typeorm';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { Producto } from '../entities/producto.entity';
import { DeleteProductoDto } from '../dto/delete-producto.dto';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Linea } from 'src/modules/lineas/entities/linea.entity';
import { Marca } from 'src/modules/marcas/entities/marca.entity';

export interface IProductosRepository {
  create(
    createProductoDto: CreateProductoDto,
    usuario: Usuario,
    marca: Marca,
    linea: Linea,
  ): Promise<Producto>;
  findOne(id: number): Promise<Producto | null>;
  findByCodigo(codigo: string): Promise<Producto | null>;
  decrementStock(id: number, cantidad: number): Promise<UpdateResult>;
  update(id: number, data: UpdateProductoDto): Promise<UpdateResult>;
  remove(id: DeleteProductoDto): Promise<UpdateResult>;
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
