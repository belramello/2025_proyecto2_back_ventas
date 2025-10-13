import { Injectable } from '@nestjs/common';
import { RespuestaFindOneDetalleVentaDto } from '../dto/respuesta-find-one-detalle-venta.dto';
import { DetalleVenta } from '../entities/detalle-venta.entity';

@Injectable()
export class DetalleVentaMapper {
  toResponseDto(venta: DetalleVenta): RespuestaFindOneDetalleVentaDto {
    return {
      id: venta.id,
      subtotal: venta.precioUnitario * venta.cantidad,
      productoId: venta.producto.id,
      productoNombre: venta.producto.nombre,
      cantidad: venta.cantidad,
      precioUnitario: venta.precioUnitario,
    };
  }
}
