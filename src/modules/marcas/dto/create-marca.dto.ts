import { IsString, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { MarcaNombreUniqueValidator } from '../helpers/marcas-validator';

export class CreateMarcaDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser texto' })
  @Validate(MarcaNombreUniqueValidator, {
    message: 'El nombre de la marca ya está registrado',
  })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  descripcion?: string;
}
