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
      codigo: detalle.producto?.codigo,
      proveedorId: detalle.proveedor.id,
      proveedorNombre: detalle.proveedor.nombre,
    };
  }

  toResponsesDto(
    detalles: DetalleProveedorProducto[],
  ): RespuestaFindOneDetalleProveedorProductoDto[] {
    return detalles.map((detalle) => this.toResponseDto(detalle));
  }
}
