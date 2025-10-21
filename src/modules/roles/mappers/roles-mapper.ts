import { Injectable } from '@nestjs/common';
import { Rol } from '../entities/rol.entity';
import { RespuestaFindOneRolesDto } from '../dto/respuesta-find-one-roles.dto';

@Injectable()
export class RolesMapper {
  toRespuestaFindOneRoles(roles: Rol[]): RespuestaFindOneRolesDto[] {
    return roles.map((rol) => this.toRespuestaFindOne(rol));
  }

  toRespuestaFindOne(rol: Rol): RespuestaFindOneRolesDto {
    return {
      id: rol.id,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      modificable: rol.modificable,
      permisos: rol.permisos,
    };
  }
}
