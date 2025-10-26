import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMarcaDto {
  @ApiProperty({ description: 'Nombre único de la marca', example: 'Bic' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser texto' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción de la marca',
    example: 'Artículos de librería',
  })
  @IsOptional()
  @IsString({ message: 'El logo debe ser texto (URL)' })
  logo?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la marca',
    example: 'Artículos de librería',
  })
  descripcion?: string;

  @ApiProperty({
    description: 'Lista de IDs de líneas asociadas a la marca',
    example: [8],
  })
  @IsArray({ message: 'lineasId debe ser un arreglo de números' })
  @ArrayNotEmpty({ message: 'Debe incluir al menos una línea' })
  @IsInt({ each: true, message: 'Cada línea debe ser un número entero' })
  lineasId: number[];
}
