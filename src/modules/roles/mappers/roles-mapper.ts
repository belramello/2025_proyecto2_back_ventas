import { Injectable } from '@nestjs/common';
import { Rol } from '../entities/rol.entity';
import { RespuestaFindAllRoles } from '../dto/respuesta-find-one-roles.dto';

@Injectable()
export class RolesMapper {
  toRespuestaFindAllRoles(roles: Rol[]): RespuestaFindAllRoles[] {
    return roles.map((rol) => ({
      id: rol.id,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      modificable: rol.modificable,
    }));
  }
}
