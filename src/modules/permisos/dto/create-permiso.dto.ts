import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermisoDto {
  @ApiProperty({ example: 'Crear producto', description: 'Nombre del permiso' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nombre: string;

  @ApiProperty({
    example: 'PRODUCTOS',
    description: 'Categoría del permiso',
    enum: ['PRODUCTOS', 'MARCAS', 'VENTAS', 'STOCK', 'USUARIOS', 'SEGURIDAD'],
  })
  @IsEnum(['PRODUCTOS', 'MARCAS', 'VENTAS', 'STOCK', 'USUARIOS', 'SEGURIDAD'])
  @IsNotEmpty()
  categoria:
    | 'PRODUCTOS'
    | 'MARCAS'
    | 'VENTAS'
    | 'STOCK'
    | 'USUARIOS'
    | 'SEGURIDAD';
}
