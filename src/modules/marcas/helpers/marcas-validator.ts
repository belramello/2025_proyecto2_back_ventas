import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { MarcaRepository } from '../repositories/marca-repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class MarcaNombreUniqueValidator
  implements ValidatorConstraintInterface
{
  constructor(private marcaRepository: MarcaRepository) {}

  async validate(nombre: string): Promise<boolean> {
    const marca = await this.marcaRepository.findByNombre(nombre);
    return !marca;
  }
}
