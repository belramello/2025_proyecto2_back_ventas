import { IsInt, IsPositive, Min } from 'class-validator';

export class DetalleVentaDto {
  @IsInt()
  @IsPositive()
  productoId: number;

  @IsInt()
  @Min(1)
  cantidad: number;
}
