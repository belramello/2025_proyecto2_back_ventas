import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class FindOneMarcaDto {
  @ApiProperty({ example: 5, description: 'ID de la marca que se quiere buscar (soft delete)' })
  @IsInt()
  @Min(1)
  id: number;
}
