import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUrl, IsOptional, IsDate, IsInt, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { RespuestaFindOneDetalleProveedorProductoDto } from 'src/modules/detalleproveedorproducto/dto/respuesta-find-one-detalleproveedorproducto.dto';

export class RespuestaCreateProductoDto {
  @ApiProperty({ example: 'Collar para perro', description: 'Nombre del producto' })
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

  /*@ApiProperty({ example: 'Pedigree', description: 'Marca del producto' })
  @IsString()
  @MaxLength(50)
  marca: string;*/

  @ApiProperty({ example: 30, description: 'Cantidad de stock disponible' })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'Premium', description: 'Línea o categoría del producto' })
  @IsString()
  @MaxLength(50)
  linea: string;
  @ApiProperty({description: 'Detalles de la venta',type: [RespuestaFindOneDetalleProveedorProductoDto],})
  detalles: RespuestaFindOneDetalleProveedorProductoDto[];

  @ApiProperty({ example: 'https://example.com/foto.jpg', description: 'URL de la imagen del producto' })
  @IsUrl()
  fotoUrl: string;

  @ApiProperty({ example: '2025-10-11', description: 'Fecha de creación del producto', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaCreacion?: Date;

  @ApiProperty({ example: 'Collar resistente y ajustable para perros grandes', description: 'Descripción detallada' })
  @IsString()
  @MaxLength(255)
  descripcion: string;

}