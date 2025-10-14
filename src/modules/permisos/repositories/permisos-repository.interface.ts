import { CreatePermisoDto } from '../dto/create-permiso.dto';
import { Permiso } from '../entities/permiso.entity';

export interface IPermisosRepository {
  create(createVentaDto: CreatePermisoDto): Promise<Permiso>;
  findAll(): Promise<Permiso[]>;
  findAllByRol(id: number): Promise<Permiso[]>;
  findOne(rolId: number): Promise<Permiso | null>;
}
