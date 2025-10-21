import { Permiso } from '../../../modules/permisos/entities/permiso.entity';
import { CreateRolDto } from '../dto/create-rol.dto';
import { Rol } from '../entities/rol.entity';

export interface IRolesRepository {
  create(createRolDto: CreateRolDto, permisos: Permiso[]): Promise<Rol>;
  findAll(): Promise<Rol[]>;
  findOne(rolId: number): Promise<Rol | null>;
  updatePermisos(rol: Rol, permisos: Permiso[]): Promise<void>;
}
