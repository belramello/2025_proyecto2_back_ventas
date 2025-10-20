import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @ApiProperty({
    example: 'Alejo',
    description: 'Nombre del usuario',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre?: string;

  @ApiProperty({
    example: 'De Miguel',
    description: 'Apellido del usuario',
  })
  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  apellido?: string;

  @ApiProperty({
    example: 'alejodm12345@gmail.com',
    description: 'Email único del usuario',
  })
  @IsOptional()
  @IsString({ message: 'El email debe ser una cadena de texto' })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email?: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario',
  })
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password?: string;
}
