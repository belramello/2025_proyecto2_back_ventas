import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Marca } from '../entities/marca.entity';
import { MarcaRepositoryInterface } from './marca-repository.interface';

@Injectable()
export class MarcaRepository extends Repository<Marca> implements MarcaRepositoryInterface {
  constructor(dataSource: DataSource) {
    super(Marca, dataSource.createEntityManager());
  }

  async findByNombre(nombre: string): Promise<Marca | null> {
    return this.findOneBy({ nombre });
  }
}
