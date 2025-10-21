import { ApiProperty } from '@nestjs/swagger';

export class RespuestaCreateHistorialDto {
  @ApiProperty({ example: 1, description: 'ID del historial creado' })
  id: number;

  @ApiProperty({
    example: 7,
    description: 'ID del usuario que realizó la acción',
  })
  usuario: number;

  @ApiProperty({
    example: 'CREAR_PUBLICACION',
    description: 'Acción realizada',
  })
  accion: string;

  @ApiProperty({
    example: '2025-10-13T14:32:00.000Z',
    description: 'Fecha y hora en que se realizó la acción',
  })
  fechaHora: Date;

  @ApiProperty({ example: 'ACTIVO', description: 'Estado del historial' })
  estado: string;
}
