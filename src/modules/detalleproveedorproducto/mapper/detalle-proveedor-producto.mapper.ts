import { Injectable } from '@nestjs/common';
import { RespuestaFindOneDetalleProveedorProductoDto } from '../dto/respuesta-find-one-detalleproveedorproducto.dto';
import { DetalleProveedorProducto } from '../entities/detalleproveedorproducto.entity';

@Injectable()
export class DetalleProveedorProductoMapper {
  toResponseDto(
    detalle: DetalleProveedorProducto,
  ): RespuestaFindOneDetalleProveedorProductoDto {
    return {
      id: detalle.id,
      codigo: detalle.producto.codigo,
      proveedorId: detalle.proveedor.id,
      proveedorNombre: detalle.proveedor.nombre,
      productoId: detalle.producto.id,
      productoNombre: detalle.producto.nombre,
    };
  }
}
