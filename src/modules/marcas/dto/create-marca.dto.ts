import { IsString, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MarcaNombreUniqueValidator } from '../helpers/marcas-validator';

export class CreateMarcaDto {
  @ApiProperty({ description: 'Nombre único de la marca', example: 'Bic' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser texto' })
  @Validate(MarcaNombreUniqueValidator, {
    message: 'El nombre de la marca ya está registrado',
  })
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción de la marca', example: 'Artículos de librería' })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  descripcion?: string;
  @IsOptional()
  @IsString()
  logo?: string; // El controlador asignará el filename aquí
}