import { Permiso } from 'src/modules/permisos/entities/permiso.entity';
import { ApiProperty } from '@nestjs/swagger';

export class RespuestaFindOneRolesDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Dueño', description: 'Nombre del rol' })
  nombre: string;

  @ApiProperty({ example: 'Rol de dueño', description: 'Descripción del rol' })
  descripcion: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el rol es modificable',
  })
  modificable: boolean;

  @ApiProperty({ type: [Permiso], description: 'Permisos asociados al rol' })
  permisos: Permiso[];
}
