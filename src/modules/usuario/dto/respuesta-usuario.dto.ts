import { ApiProperty } from '@nestjs/swagger';
import { RespuestaFindOneRolesDto } from '../../../modules/roles/dto/respuesta-find-one-roles.dto';

export class RespuestaUsuarioDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador único del usuario',
    type: Number,
  })
  id: number;

  @ApiProperty({
    example: 'Alejo',
    description: 'Nombre del usuario',
    type: String,
  })
  nombre: string;

  @ApiProperty({
    example: 'De Miguel',
    description: 'Apellido del usuario',
    type: String,
  })
  apellido: string;

  @ApiProperty({
    example: 'alejodm12345@gmail.com',
    description: 'Email único del usuario',
    type: String,
  })
  email: string;

  @ApiProperty({
    example: '2023-10-01T12:00:00Z',
    description: 'Fecha y hora de creación del usuario',
    type: String,
    format: 'date-time',
  })
  fechaHoraCreacion: Date;

  @ApiProperty({
    example: 'Dueño',
    description: 'Descripción del rol del usuario (Dueño, Vendedor, etc)',
    type: String,
  })
  rol: RespuestaFindOneRolesDto;
}
