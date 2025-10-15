import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({
    example: 'Alejo',
    description: 'Nombre del usuario',
  })
  @IsNotEmpty({ message: 'El nombre no debe estar vacío' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @ApiProperty({
    example: 'De Miguel',
    description: 'Apellido del usuario',
  })
  @IsNotEmpty({ message: 'El apellido no debe estar vacío' })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  apellido: string;

  @ApiProperty({
    example: 'alejodm12345@gmail.com',
    description: 'Email único del usuario',
  })
  @IsNotEmpty({ message: 'El email no debe estar vacío' })
  @IsString({ message: 'El email debe ser una cadena de texto' })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario',
  })
  @IsNotEmpty({ message: 'La contraseña no debe estar vacía' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsInt()
  rolId: number;
}
