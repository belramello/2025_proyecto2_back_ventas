import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsUrl, IsOptional, MaxLength, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class RespuestaCreateProveedorDto {
  @ApiProperty({
    example: 1,
    description: 'ID autogenerado del proveedor',
  })
  id: number;

  @ApiProperty({
    example: 'Librería Máximo',
    description: 'Nombre comercial del proveedor',
  })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({
    example: 'Av. Siempre Viva 742, Rosario, Santa Fe',
    description: 'Dirección física del proveedor',
  })
  @IsString()
  @MaxLength(150)
  direccion: string;

  @ApiProperty({
    example: 'libreriamaximo@gmail.com',
    description: 'Correo electrónico de contacto del proveedor',
  })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    example: '+54 9 341 555-1234',
    description: 'Número de teléfono o WhatsApp del proveedor',
  })
  @IsString()
  @MaxLength(50)
  contacto: string;

  @ApiProperty({
    example: 'Santa Fe',
    description: 'Provincia donde se ubica el proveedor',
  })
  @IsString()
  @MaxLength(100)
  provincia: string;

  @ApiProperty({
    example: 'Rosario',
    description: 'Localidad o ciudad donde se encuentra el proveedor',
  })
  @IsString()
  @MaxLength(100)
  localidad: string;

  @ApiProperty({
    example: 'https://libreriamaximo.com/logo.png',
    description: 'URL del logotipo o imagen representativa del proveedor',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({
    example: '2025-10-22',
    description: 'Fecha de registro del proveedor en el sistema',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaRegistro?: Date;
}
