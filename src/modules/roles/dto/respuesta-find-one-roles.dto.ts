import { Permiso } from 'src/modules/permisos/entities/permiso.entity';

export class RespuestaFindOneRolesDto {
  id: number;
  nombre: string;
  descripcion: string;
  modificable: boolean;
  permisos: Permiso[];
}
