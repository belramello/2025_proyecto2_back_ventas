import { UpdateResult } from 'typeorm';
import { CreateMarcaDto } from '../dto/create-marca.dto';
import { UpdateMarcaDto } from '../dto/update-marca.dto';
import { Marca } from '../entities/marca.entity';

export interface IMarcaRepository {
  create(data: CreateMarcaDto): Promise<Marca>;
  findAll(): Promise<Marca[]>;
  findOne(id: number): Promise<Marca | null>;
  findByNombre(nombre: string): Promise<Marca | null>;
  update(id: number, data: UpdateMarcaDto): Promise<UpdateResult>;
  remove(id: number): Promise<UpdateResult>; // Soft delete
  restore(id: number): Promise<UpdateResult>;
}
