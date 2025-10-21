import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermisosRolDto {
  @ApiProperty({
    description: 'Array de IDs de permisos a asignar al rol',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNotEmpty()
  permisosId: number[];
}
