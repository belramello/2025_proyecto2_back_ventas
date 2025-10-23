import { IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DetalleProveedorProductoDto {
  @ApiProperty({
    description: 'Código del producto asignado por el proveedor',
    example: 'PROV-1234',
  })
  @IsString()
  codigo: string;

  @ApiProperty({
    description: 'ID del proveedor asociado al producto',
    example: 5,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  proveedorId: number;

  @ApiProperty({
    description: 'ID del producto que ofrece el proveedor',
    example: 12,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productoId: number;
}
