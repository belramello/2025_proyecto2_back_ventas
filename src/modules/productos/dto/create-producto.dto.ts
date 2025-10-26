import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsUrl,
  IsInt,
  Min,
  MaxLength,
  ValidateNested,
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
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleProveedorProductoDto)
  detalleProveedores: CreateDetalleProveedorProductoDto[];

  @ApiProperty({
    example: 'https://example.com/foto.jpg',
    description: 'URL de la imagen del producto',
  })
  @IsUrl()
  fotoUrl: string;

  @ApiProperty({
    example: 'Collar resistente y ajustable para perros grandes',
    description: 'Descripción detallada',
  })
  @IsString()
  @MaxLength(255)
  descripcion: string;
}
