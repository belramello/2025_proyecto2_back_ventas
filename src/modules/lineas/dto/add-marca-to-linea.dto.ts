import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AddMarcaToLineaDto {
  @ApiProperty({ example: 3, description: 'ID de la línea existente' })
  @IsInt()
  lineaId: number;

  @ApiProperty({ example: 1, description: 'ID de la marca a asociar' })
  @IsInt()
  marcaId: number;
}
