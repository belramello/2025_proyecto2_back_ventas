import { Injectable } from '@nestjs/common';
import { Usuario } from '../entities/usuario.entity';
import { RespuestaUsuarioDto } from '../dto/respuesta-usuario.dto';

@Injectable()
export class UsuariosMappers {
  toResponseDto(usuario: Usuario): RespuestaUsuarioDto {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      fechaHoraCreacion: usuario.fechaCreacion,
      rol: usuario.rol.nombre,
    };
  }

  toResponseDtos(usuarios: Usuario[]): RespuestaUsuarioDto[] {
    return usuarios.map((usuario) => this.toResponseDto(usuario));
  }
}
