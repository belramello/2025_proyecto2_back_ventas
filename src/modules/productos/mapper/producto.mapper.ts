import { Injectable } from '@nestjs/common';
import { Producto } from '../entities/producto.entity';
import { RespuestaCreateProductoDto } from '../dto/respuesta-create-producto.dto';
import { RespuestaFindOneProductoDto } from '../dto/respuesta-find-one-producto.dto';
import { RespuestaFindAllPaginatedProductoDTO } from '../dto/respuesta-find-all-paginated.dto';
import { DetalleProveedorProductoMapper } from 'src/modules/detalleproveedorproducto/mapper/detalle-proveedor-producto.mapper';

@Injectable()
export class ProductoMapper {
  constructor(
    private readonly detalleProveedorProductoMapper: DetalleProveedorProductoMapper,
  ) {}

  toRespuestaCreateProducto(producto: Producto): RespuestaCreateProductoDto {
    return {
      nombre: producto.nombre,
      codigo: producto.codigo,
      precio: producto.precio,
      stock: producto.stock,
      linea: producto.linea?.nombre,
      fotoUrl: producto.fotoUrl,
      descripcion: producto.descripcion,
      detalles: this.detalleProveedorProductoMapper.toResponsesDto(
        producto.detallesProveedor,
      ),
    };
  }

  toRespuestaFinalFindOneDto(producto: Producto): RespuestaFindOneProductoDto {
    const detalles = this.detalleProveedorProductoMapper.toResponsesDto(
      producto.detallesProveedor,
    );
    return {
      id: producto.id,
      nombre: producto.nombre,
      codigo: producto.codigo,
      precio: producto.precio,
      stock: producto.stock,
      linea: producto.linea?.nombre,
      fotoUrl: producto.fotoUrl,
      fechaCreacion: producto.fechaCreacion,
      descripcion: producto.descripcion,
      detalles,
    };
  }

  toRespuestaFindAllProductosDTO(
    productos: Producto[],
  ): RespuestaFindOneProductoDto[] {
    return productos.map((producto) =>
      this.toRespuestaFinalFindOneDto(producto),
    );
  }

  toRespuestaFindAllPaginatedProductoDTO(paginated: {
    productos: Producto[];
    total: number;
    page: number;
    lastPage: number;
  }): RespuestaFindAllPaginatedProductoDTO {
    return {
      productos: this.toRespuestaFindAllProductosDTO(paginated.productos),
      total: paginated.total,
      page: paginated.page,
      lastPage: paginated.lastPage,
    };
  }
}
