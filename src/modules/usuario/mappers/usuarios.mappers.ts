import { Injectable } from '@nestjs/common';
import { Usuario } from '../entities/usuario.entity';
import { RespuestaUsuarioDto } from '../dto/respuesta-usuario.dto';
import { RespuestaFindAllPaginatedUsuariosDTO } from '../dto/respuesta-find-all-usuarios-paginated.dto';
import { RolesMapper } from 'src/modules/roles/mappers/roles-mapper';

@Injectable()
export class UsuariosMappers {
  constructor(private readonly rolesMapper: RolesMapper) {}

  toResponseDto(usuario: Usuario): RespuestaUsuarioDto {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      fechaHoraCreacion: usuario.fechaCreacion,
      rol: this.rolesMapper.toRespuestaFindOne(usuario.rol),
    };
  }

  toRespuestaFindAllUsuariosDTO(usuarios: Usuario[]): RespuestaUsuarioDto[] {
    return usuarios.map((usuario) => this.toResponseDto(usuario));
  }

  toRespuestaFindAllPaginatedUsuariosDTO(paginated: {
    usuarios: Usuario[];
    total: number;
    page: number;
    lastPage: number;
  }): RespuestaFindAllPaginatedUsuariosDTO {
    return {
      usuarios: this.toRespuestaFindAllUsuariosDTO(paginated.usuarios),
      total: paginated.total,
      page: paginated.page,
      lastPage: paginated.lastPage,
    };
  }

  toResponseDtos(usuarios: Usuario[]): RespuestaUsuarioDto[] {
    return usuarios.map((usuario) => this.toResponseDto(usuario));
  }
}
