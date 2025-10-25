import { Repository } from 'typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Marca } from '../entities/marca.entity';
import { MarcaRepositoryInterface } from './marca-repository.interface';
import { FindOneMarcaDto } from '../dto/findOne-marca.dto';

@Injectable()
export class MarcaRepository implements MarcaRepositoryInterface
{
 constructor(private readonly marcaRepository: Repository<Marca>){}
  async findByNombre(nombre: string): Promise<Marca | null> {
    return this.marcaRepository.findOneBy({ nombre });
  }

  async findOne(data: FindOneMarcaDto): Promise<Marca | null> {
    try {
      const marca = await this.marcaRepository.findOne({
        where: {
          id: data.id,
        },
      });

      return marca;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al buscar la marca con ID ${data.id}: ${error.message}`,
      );
    }
  }
}
