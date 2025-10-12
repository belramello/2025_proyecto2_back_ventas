import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'alejodm12345@gmail.com',
    description: 'Email del usuario',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Contraseña123',
    description: 'Contraseña del usuario',
    required: true,
  })
  @IsNotEmpty({ message: 'La contraseña no debe estar vacía' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;
}
