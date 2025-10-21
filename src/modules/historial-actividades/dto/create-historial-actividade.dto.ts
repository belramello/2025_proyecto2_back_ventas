import { ApiProperty } from '@nestjs/swagger';
import { Accion } from '../entities/accion.entity';
import { Estado } from '../entities/estado.entity';

export class CreateHistorialActividadesDto {
  @ApiProperty({
    example: 1,
    description: 'ID del usuario que realizó la acción',
  })
  usuario: number;

  @ApiProperty({
    type: () => Accion,
    description: 'Acción realizada por el usuario',
  })
  accion: Accion;

  @ApiProperty({
    type: () => Estado,
    description: 'Estado resultante de la acción',
  })
  estado: Estado;
}
