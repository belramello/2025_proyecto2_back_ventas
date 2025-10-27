/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsInt,
  Min,
  MaxLength,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { CreateDetalleProveedorProductoDto } from '../../../modules/detalleproveedorproducto/dto/create-detalleproveedorproducto.dto';

export class CreateProductoDto {
  @ApiProperty({
    example: 'Collar para perro',
    description: 'Nombre del producto',
  })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'ABC0123', description: 'Código del producto' })
  @IsString()
  @MaxLength(100)
  codigo: string;

  @ApiProperty({ example: 2499.99, description: 'Precio del producto' })
  @IsNumber()
  @Min(0)
  precio: number;

  @ApiProperty({ example: 30, description: 'Cantidad de stock disponible' })
  @IsInt()
  @Min(0)
  stock: number;
  @ApiProperty({
    example: 'Faber Castell',
    description: 'Marca del producto',
  })
  @IsInt()
  marcaId: number;

  @ApiProperty({
    example: 'Premium',
    description: 'Línea o categoría del producto',
  })
  @IsInt()
  lineaId: number;

  @ApiProperty({
    type: [CreateDetalleProveedorProductoDto],
    description: 'Listado de proveedores del producto',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return value;
  })
  @IsArray({ message: 'detalleProveedores debe ser un array válido' })
  @ArrayMinSize(1, { message: 'Debe haber al menos un detalle de proveedor' })
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleProveedorProductoDto)
  detalleProveedores: CreateDetalleProveedorProductoDto[];

  @ApiProperty({
    example: 'Collar resistente y ajustable para perros grandes',
    description: 'Descripción detallada',
  })
  @IsString()
  @MaxLength(255)
  descripcion: string;
}
