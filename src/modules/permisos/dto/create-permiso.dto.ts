import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePermisoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nombre: string;

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
