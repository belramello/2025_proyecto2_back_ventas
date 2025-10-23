import { UpdateResult } from 'typeorm';
import { CreateProveedoreDto } from '../dto/create-proveedore.dto';

import { Proveedor } from '../entities/proveedore.entity';
import { FindOneProveedoreDto } from '../dto/findOne-proveedore.dto';
import { DeleteProveedoreDto } from '../dto/delete-proveedore.dto';

export interface IProveedoresRepository {
  create(data: CreateProveedoreDto): Promise<Proveedor>;
  findAll(): Promise<Proveedor[]>;
  findOne(data: FindOneProveedoreDto): Promise<Proveedor | null>;
  findByNombre(nombre: string): Promise<Proveedor | null>;
  remove(data: DeleteProveedoreDto): Promise<UpdateResult>;

  findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{
    proveedores: Proveedor[];
    total: number;
    page: number;
    lastPage: number;
  }>;
}
