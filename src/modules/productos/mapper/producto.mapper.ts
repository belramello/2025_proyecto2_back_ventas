import { Injectable } from '@nestjs/common';
import { Producto } from '../entities/producto.entity';
import { RespuestaCreateProductoDto } from '../dto/respuesta-create-producto.dto';
import { RespuestaFindOneProductoDto } from '../dto/respuesta-find-one-producto.dto';
import { RespuestaFindAllPaginatedProductoDTO } from '../dto/respuesta-find-all-paginated.dto';

@Injectable()
export class ProductoMapper {
  toRespuestaCreateProducto(producto: Producto): RespuestaCreateProductoDto {
    return {
      nombre: producto.nombre,
      codigo: producto.codigo,
      precio: producto.precio,
      marca: producto.marca.id,
      stock: producto.stock,
      linea: producto.linea,
      fotoUrl: producto.fotoUrl,
      descripcion: producto.descripcion,
    };
  }

  toRespuestaFinalFindOneDto(producto: Producto): RespuestaFindOneProductoDto {
    return {
      id: producto.id,
      nombre: producto.nombre,
      codigo: producto.codigo,
      precio: producto.precio,
      marca: producto.marca.id,
      stock: producto.stock,
      linea: producto.linea,
      fotoUrl: producto.fotoUrl,
      fechaCreacion: producto.fechaCreacion,
      descripcion: producto.descripcion,
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
