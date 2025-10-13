import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// ...existing code...
export class DetalleVentaDto {
  @ApiProperty({ description: 'ID del producto', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productoId: number;

  @ApiProperty({ description: 'Cantidad de ese producto', example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad: number;
}
