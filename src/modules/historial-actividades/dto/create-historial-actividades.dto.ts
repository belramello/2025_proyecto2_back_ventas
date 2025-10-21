import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateHistorialActividadesDto {
  @ApiProperty({
    example: 1,
    description: 'ID del usuario que realizó la acción',
  })
  @IsNumber()
  usuario: number;

  @ApiProperty({
    example: 2,
    description: 'ID de la acción realizada por el usuario',
  })
  @IsNumber()
  accionId: number;

  @ApiProperty({
    example: 3,
    description: 'ID del estado resultante de la acción',
  })
  @IsNumber()
  estadoId: number;
}
