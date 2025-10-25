import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable, Inject } from '@nestjs/common';
import type { IMarcaRepository } from '../repositories/marca-repository.interface';
import { UpdateMarcaDto } from '../dto/update-marca.dto';

@ValidatorConstraint({ name: 'MarcaNombreUnique', async: true })
@Injectable()
export class MarcaNombreUniqueValidator
  implements ValidatorConstraintInterface
{
  constructor(
    @Inject('IMarcaRepository')
    private readonly marcaRepository: IMarcaRepository,
  ) {}

  async validate(nombre: string, args: ValidationArguments): Promise<boolean> {
    const id = (args.object as UpdateMarcaDto).id; // Obtiene el ID del DTO
    const marca = await this.marcaRepository.findByNombre(nombre);

    if (!marca) return true; // Si no existe, es válido
    if (id && marca.id === id) return true; // Si existe pero es el mismo ID, es válido

    return false; // Si existe y es otro ID, no es válido
  }

  defaultMessage(args: ValidationArguments) {
    return `El nombre de la marca '${args.value}' ya está registrado.`;
  }
}
