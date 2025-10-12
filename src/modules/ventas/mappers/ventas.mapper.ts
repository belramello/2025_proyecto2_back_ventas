import { Injectable } from '@nestjs/common';
import { RespuestaCreateVentaDto } from '../dto/respuesta-create-venta.dto';
import { Venta } from '../entities/venta.entity';

@Injectable()
export class VentasMapper {
  toResponseDto(venta: Venta): RespuestaCreateVentaDto {
    return {
      id: venta.id,
      total: venta.total,
      medioDePago: venta.medioDePago,
      //vendedor: venta.vendedor.nombre + ' ' + venta.vendedor.apellido,
    };
  }
}
