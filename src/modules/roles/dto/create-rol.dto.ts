import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRolDto {
  @ApiProperty({ example: 'Dueño', description: 'Nombre del rol' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nombre: string;

  @ApiProperty({
    example: 'Rol dueño con todos los permisos',
    description: 'Descripción del rol',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  descripcion: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el rol puede ser modificado',
  })
  @IsBoolean()
  modificable: boolean;

  @ApiProperty({
    description: 'IDs de permisos iniciales del rol',
    type: [Number],
    example: [1, 2],
  })
  @IsArray()
  @IsNotEmpty()
  permisosId: number[];
}
