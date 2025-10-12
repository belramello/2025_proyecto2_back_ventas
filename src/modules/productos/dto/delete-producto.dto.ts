import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class DeleteProductoDto {
  @ApiProperty({ example: 5, description: 'ID del producto a eliminar (soft delete)' })
  @IsInt()
  @Min(1)
  id: number;
}
