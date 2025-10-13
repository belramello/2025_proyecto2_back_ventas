import { ApiProperty } from '@nestjs/swagger';

// ...existing code...
export class RespuestaFindOneDetalleVentaDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 2 })
  cantidad: number;

  @ApiProperty({ example: 10.5 })
  precioUnitario: number;

  @ApiProperty({ example: 21 })
  subtotal: number;

  @ApiProperty({ description: 'ID del producto asociado', example: 5 })
  productoId: number;

  @ApiProperty({ description: 'Nombre del producto', example: 'Cámara' })
  productoNombre: string;
}
