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

  @ApiProperty({
    description: 'Vendedor que realizó la venta',
    example: 'Carolina Corazza',
  })
  vendedor: string;

  @ApiProperty({
    description: 'Fecha en la que se registró la venta',
    example: '2023-10-01T12:00:00Z',
  })
  fecha: Date;
}
