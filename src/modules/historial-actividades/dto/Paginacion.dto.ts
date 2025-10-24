
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginacionDto {
  @ApiProperty({ example: 1, description: 'Número de página', required: false })
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ example: 10, description: 'Límite de registros por página', required: false })
  @IsNumber()
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ example: 'john', description: 'Término de búsqueda para usuario', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: 'Iniciar sesion', description: 'Filtro por nombre de acción', required: false })
  @IsString()
  @IsOptional()
  action?: string;
}