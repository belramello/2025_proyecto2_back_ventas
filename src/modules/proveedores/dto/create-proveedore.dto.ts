import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MaxLength,
} from 'class-validator';

export class CreateProveedoreDto {
  @ApiProperty({
    example: 'Librería Máximo.',
    description: 'Nombre del proveedor',
  })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({
    example: 'Av. Siempre Viva 742, Rosario, Santa Fe',
    description: 'Dirección completa del proveedor',
  })
  @IsString()
  @MaxLength(150)
  direccion: string;

  @ApiProperty({
    example: 'libreriamaximo@gmail.com',
    description: 'Correo electrónico del proveedor',
  })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    example: '+54 9 341 555-1234',
    description: 'Número de contacto telefónico del proveedor',
  })
  @IsString()
  @MaxLength(50)
  contacto: string;

  @ApiProperty({
    example: 'Rosario',
    description: 'Localidad donde se encuentra el proveedor',
  })
   @IsString()
  @MaxLength(100)
  provincia: string;

  @IsString()
  @MaxLength(100)
  localidad: string;
}
