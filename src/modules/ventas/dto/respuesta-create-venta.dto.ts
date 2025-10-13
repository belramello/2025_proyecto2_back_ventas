import { ApiProperty } from '@nestjs/swagger';

export class RespuestaCreateVentaDto {
  @ApiProperty({ description: 'ID de la venta creada', example: 10 })
  id: number;

  @ApiProperty({ description: 'Total calculado de la venta', example: 123.45 })
  total: number;

  @ApiProperty({
    description: 'Medio de pago usado en la venta',
    example: 'efectivo',
  })
  medioDePago: string;
  //vendedor: string;
}
