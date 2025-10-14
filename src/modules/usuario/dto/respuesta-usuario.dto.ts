import { ApiProperty } from '@nestjs/swagger';

export class RespuestaUsuarioDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador único del usuario',
    type: Number,
    required: true,
  })
  id: number;

  @ApiProperty({
    example: 'Alejo',
    description: 'Nombre del usuario',
    type: String,
    required: true,
  })
  nombre: string;

  @ApiProperty({
    example: 'De Miguel',
    description: 'Apellido del usuario',
    type: String,
    required: true,
  })
  apellido: string;

  @ApiProperty({
    example: 'alejodm12345@gmail.com',
    description: 'Email único del usuario',
    type: String,
    required: true,
  })
  email: string;

  @ApiProperty({
    example: '2023-10-01T12:00:00Z',
    description: 'Fecha y hora de creación del usuario',
    type: String,
    format: 'date-time',
    required: true,
  })
  fechaHoraCreacion: Date;

  rol: string;
}
