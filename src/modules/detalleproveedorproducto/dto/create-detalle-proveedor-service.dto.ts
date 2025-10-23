import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';
import { Producto } from 'src/modules/productos/entities/producto.entity';
import { Proveedor } from 'src/modules/proveedores/entities/proveedore.entity';

export class CreateDetalleProveedorProductoServiceDto {
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

  producto: Producto;
}
