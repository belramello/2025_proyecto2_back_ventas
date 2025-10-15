import { RespuestaFindOneDetalleVentaDto } from '../detalle-ventas/dto/respuesta-find-one-detalle-venta.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RespuestaFindOneVentaDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 123.45 })
  total: number;
  @ApiProperty({
    description: 'Medio de pago de la venta',
    example: 'efectivo',
  })
  medioDePago: string;

  @ApiProperty({
    description: 'Vendedor que realizó la venta',
    type: [String],
  })
  vendedor: string;

  @ApiProperty({
    description: 'Fecha en la que se registró la venta',
    type: [Date],
  })
  fecha: Date;

  @ApiProperty({
    description: 'Detalles de la venta',
    type: [RespuestaFindOneDetalleVentaDto],
  })
  detalles: RespuestaFindOneDetalleVentaDto[];
}
