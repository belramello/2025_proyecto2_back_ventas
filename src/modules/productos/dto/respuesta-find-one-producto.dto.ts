import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  Min,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsUrl,
  IsPositive,
} from 'class-validator';

export class RespuestaFindOneProductoDto {
  @ApiProperty({ example: 3, description: 'ID del producto' })
  @IsInt()
  @Min(1)
  id: number;

  @ApiProperty({
    example: 'Mochila Escolar Ergonómica',
    description: 'Nombre del producto',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    example: 'MOCH842',
    description: 'Código único o SKU del producto',
  })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ example: 7990.5, description: 'Precio de venta unitario' })
  @IsNumber()
  @IsPositive()
  precio: number;

  @ApiProperty({ example: 50, description: 'Cantidad actual en stock' })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({
    example: 'Mochilas',
    description: 'Línea o Categoría del producto',
  })
  @IsString()
  @IsNotEmpty()
  linea: string;

  @ApiProperty({
    example: 'https://api.ejemplo.com/v1/foto.jpg',
    description: 'URL de la imagen del producto',
  })
  @IsUrl()
  fotoUrl: string;

  @ApiProperty({
    example: new Date().toISOString(),
    description: 'Fecha de creación del registro',
  })
  @IsDate()
  fechaCreacion: Date;

  @ApiProperty({
    example: 'Mochila con soporte lumbar, múltiples compartimentos.',
    description: 'Descripción detallada del producto',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;
}
