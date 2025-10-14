import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateRolDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  descripcion: string;

  @IsBoolean()
  modificable: boolean;

  @IsArray()
  @IsNotEmpty()
  permisosId: number[];
}
