import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUrl,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { RespuestaFindOneDetalleProveedorProductoDto } from '../../../modules/detalleproveedorproducto/dto/respuesta-find-one-detalleproveedorproducto.dto';
import { RespuestaLineaDto } from '../../../modules/lineas/dto/respuesta-linea.dto';
import { MarcaResponseDto } from '../../../modules/marcas/dto/marca-response.dto';

export class RespuestaCreateProductoDto {
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

  @ApiProperty({ example: 'Pedigree', description: 'Marca del producto' })
  @IsInt()
  marca: MarcaResponseDto;

  @ApiProperty({ example: 'Pedigree', description: 'Linea del Producto' })
  @IsInt()
  linea: RespuestaLineaDto;

  @ApiProperty({ example: 30, description: 'Cantidad de stock disponible' })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({
    example: 'Premium',
    description: 'Línea o categoría del producto',
  })
  @ApiProperty({
    description: 'Detalles de la venta',
    type: [RespuestaFindOneDetalleProveedorProductoDto],
  })
  detalles: RespuestaFindOneDetalleProveedorProductoDto[];

  @ApiProperty({
    example: 'https://example.com/foto.jpg',
    description: 'URL de la imagen del producto',
  })
  @IsUrl()
  fotoUrl: string;

  @ApiProperty({
    example: '2025-10-11',
    description: 'Fecha de creación del producto',
    required: false,
  })
  @ApiProperty({
    example: 'Collar resistente y ajustable para perros grandes',
    description: 'Descripción detallada',
  })
  @IsString()
  @MaxLength(255)
  descripcion: string;
}
