import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class FindOneProductoDto {
  @ApiProperty({ example: 3, description: 'ID del producto a buscar' })
  @IsInt()
  @Min(1)
  id: number;
}
