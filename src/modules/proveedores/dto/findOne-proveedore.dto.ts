import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class FindOneProveedoreDto {
  @ApiProperty({ example: 5, description: 'ID del proveedor que se quiere buscar (soft delete)' })
  @IsInt()
  @Min(1)
  id: number;
}
