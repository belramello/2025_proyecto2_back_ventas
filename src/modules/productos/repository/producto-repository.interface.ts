import { UpdateResult } from 'typeorm';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { Producto } from '../entities/producto.entity';
import { DeleteProductoDto } from '../dto/delete-producto.dto';
import { Usuario } from '../../../modules/usuario/entities/usuario.entity';
import { Linea } from '../../../modules/lineas/entities/linea.entity';
import { Marca } from '../../../modules/marcas/entities/marca.entity';
import { RespuestaFindOneDetalleProductoDto } from '../dto/respuesta-find-one-detalleproducto.dto';
import { RespuestaFindOneDetalleProveedorProductoDto } from 'src/modules/detalleproveedorproducto/dto/respuesta-find-one-detalleproveedorproducto.dto';

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
  update(
    id: number,
    data: UpdateProductoDto,
    usuario: Usuario,
  ): Promise<UpdateResult>;
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

  findOneByDetalle(id: number):  Promise<RespuestaFindOneDetalleProductoDto | null>;
}
