import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, Inject } from '@nestjs/common';
import type { IMarcaRepository } from '../repositories/marca-repository.interface';

@ValidatorConstraint({ async: true })
@Injectable()
export class MarcaNombreUniqueValidator
  implements ValidatorConstraintInterface
{
  constructor(
    @Inject('IMarcaRepository')
    private readonly marcaRepository: IMarcaRepository,
  ) {}

  async validate(nombre: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const marca = await this.marcaRepository.findByNombre(nombre);
    return !marca; // Retorna true si no existe, false si ya existe
  }
}
