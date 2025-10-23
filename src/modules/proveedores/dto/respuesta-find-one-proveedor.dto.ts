import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsString, IsEmail } from 'class-validator';

export class RespuestaFindOneProveedorDto {
  @ApiProperty({ example: 2, description: 'ID del proveedor a buscar' })
  @IsInt()
  @Min(1)
  id: number;

  @ApiProperty({ example: 'Librería Máximo', description: 'Nombre del proveedor' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Av. Siempre Viva 742, Rosario, Santa Fe', description: 'Dirección completa del proveedor' })
  @IsString()
  direccion: string;

  @ApiProperty({ example: 'libreriamaximo@gmail.com', description: 'Correo electrónico del proveedor' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+54 9 341 555-1234', description: 'Número de contacto telefónico del proveedor' })
  @IsString()
  contacto: string;

  @ApiProperty({ example: 'Santa Fe', description: 'Provincia donde se encuentra el proveedor' })
  @IsString()
  provincia: string;

  @ApiProperty({ example: 'Rosario', description: 'Localidad donde se encuentra el proveedor' })
  @IsString()
  localidad: string;

 
}
