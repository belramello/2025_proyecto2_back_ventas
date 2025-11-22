/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
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
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  precio: number;

  @ApiProperty({ example: 30, description: 'Cantidad de stock disponible' })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  stock: number;
  @ApiProperty({
    example: 'Faber Castell',
    description: 'Marca del producto',
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  marcaId: number;

  @ApiProperty({
    example: 'Premium',
    description: 'Línea o categoría del producto',
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  lineaId: number;

  @ApiProperty({
    type: [CreateDetalleProveedorProductoDto],
    description: 'Listado de proveedores del producto (enviar como string JSON)',
  })
  // 👇 ESTE ES EL CAMBIO MÁS IMPORTANTE
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      // Si ya es un array (ej: en pruebas), solo transfórmalo
      return Array.isArray(value)
        ? plainToInstance(CreateDetalleProveedorProductoDto, value)
        : [];
    }
    // Si es un string (desde multipart/form-data), pársalo y transfórmalo
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsedArray = JSON.parse(value);
      if (!Array.isArray(parsedArray)) {
        return [];
      }
      // Convierte cada objeto simple (POJO) en una instancia de la clase DTO
      return plainToInstance(CreateDetalleProveedorProductoDto, parsedArray);
    } catch (error) {
      console.error('Error parsing/transforming detalleProveedores:', error);
      return [];
    }
  })
  @IsArray({ message: 'detalleProveedores debe ser un array válido' })
  @ArrayMinSize(1, { message: 'Debe haber al menos un detalle de proveedor' })
  @ValidateNested({ each: true }) // <-- Ahora esto validará instancias de la clase
  @Type(() => CreateDetalleProveedorProductoDto) // <-- Lo dejamos para Swagger/metadatos
  detalleProveedores: CreateDetalleProveedorProductoDto[];

  @ApiProperty({
    example: 'Collar resistente y ajustable para perros grandes',
    description: 'Descripción detallada',
  })
  @IsString()
  @MaxLength(255)
  descripcion: string;
}
