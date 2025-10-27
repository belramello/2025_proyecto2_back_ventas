import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateDetalleProveedorProductoDto {
  @ApiProperty({
    description: 'Código del producto asignado por el proveedor',
    example: 'PROV-1234',
  })
  @Type(() => Number)
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
}
