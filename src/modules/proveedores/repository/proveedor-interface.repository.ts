import { UpdateResult } from 'typeorm';
import { CreateProveedoreDto } from '../dto/create-proveedore.dto';

import { Proveedore } from '../entities/proveedore.entity';
import { FindOneProveedoreDto } from '../dto/findOne-proveedore.dto';
import { DeleteProveedoreDto } from '../dto/delete-proveedore.dto';

export interface IProveedoresRepository {
  create(data: CreateProveedoreDto): Promise<Proveedore>;
  findAll(): Promise<Proveedore[]>;
  findOne(data: FindOneProveedoreDto): Promise<Proveedore | null>;
  findByNombre(nombre: string): Promise<Proveedore | null>;
  remove(data: DeleteProveedoreDto): Promise<UpdateResult>; 

    findAllPaginated(
        page: number,
        limit: number,
    ): Promise<{
        proveedores: Proveedore[];
        total: number;
        page: number;
        lastPage: number;
    }>;
}
