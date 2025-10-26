import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class DeleteProveedoreDto {
  @ApiProperty({
    example: 5,
    description: 'ID del proveedor a eliminar (soft delete)',
  })
  @IsInt()
  @Min(1)
  id: number;
}
