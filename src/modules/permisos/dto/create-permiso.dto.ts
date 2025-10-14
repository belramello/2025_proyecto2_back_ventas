import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePermisoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nombre: string;
}
