import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Linea } from '../entities/linea.entity';
import { Marca } from 'src/modules/marcas/entities/marca.entity';
import { ILineaRepository } from './lineas-repository.interface';

@Injectable()
export class LineaRepository implements ILineaRepository {
  constructor(
    @InjectRepository(Linea)
    private readonly lineaRepository: Repository<Linea>,
  ) {}

  async create(name: string): Promise<Linea> {
    try {
      const newLinea = this.lineaRepository.create({ nombre: name });
      return await this.lineaRepository.save(newLinea);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating line: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<Linea | null> {
    try {
      return await this.lineaRepository.findOne({
        where: { id },
        relations: ['marcas'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding line with ID ${id}: ${error.message}`,
      );
    }
  }

  async añadirMarca(linea: Linea, marca: Marca): Promise<Linea> {
    try {
      linea.marcas.push(marca);
      return await this.lineaRepository.save(linea);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error vinculando la marca con la linea: ${error.message}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.lineaRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error eliminando la marca con ID ${id}: ${error.message}`,
      );
    }
  }
}
