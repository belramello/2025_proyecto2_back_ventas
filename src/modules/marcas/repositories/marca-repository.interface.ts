import { UpdateResult } from 'typeorm';
import { CreateMarcaDto } from '../dto/create-marca.dto';
import { UpdateMarcaDto } from '../dto/update-marca.dto';
import { Marca } from '../entities/marca.entity';
import { PaginationDto } from '../dto/pagination.dto';

export interface IMarcaRepository {
  create(data: CreateMarcaDto): Promise<Marca>;
  findAllPaginated(paginationDto: PaginationDto): Promise<{
    marcas: Marca[];
    total: number;
    page: number;
    lastPage: number;
  }>;
  findOne(id: number): Promise<Marca | null>;
  findOneWithDeleted(id: number): Promise<Marca | null>;
  findByNombre(nombre: string): Promise<Marca | null>;
  update(id: number, data: UpdateMarcaDto): Promise<UpdateResult>;
  remove(id: number): Promise<UpdateResult>;
  restore(id: number): Promise<UpdateResult>;
}
