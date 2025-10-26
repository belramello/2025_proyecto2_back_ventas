import { UpdateResult } from 'typeorm';
import { CreateMarcaDto } from '../dto/create-marca.dto';
import { Marca } from '../entities/marca.entity';
import { PaginationDto } from '../dto/pagination.dto';
import { Linea } from '../../../modules/lineas/entities/linea.entity';

export interface IMarcaRepository {
  create(data: CreateMarcaDto, lineas: Linea[]): Promise<Marca>;
  findAllPaginated(paginationDto: PaginationDto): Promise<{
    marcas: Marca[];
    total: number;
    page: number;
    lastPage: number;
  }>;
  findOne(id: number): Promise<Marca | null>;
  findOneWithDeleted(id: number): Promise<Marca | null>;
  findByNombre(nombre: string): Promise<Marca | null>;
  update(marca: Marca): Promise<Marca>;
  remove(id: number): Promise<UpdateResult>;
}
