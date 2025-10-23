import { Injectable } from '@nestjs/common';
import { RespuestaUsuarioDto } from 'src/modules/usuario/dto/respuesta-usuario.dto';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';

@Injectable()
export class AuthMapper {
  toLoginResponseDto(
    accessToken: string,
    refreshToken: string,
    usuario: RespuestaUsuarioDto | Usuario,
  ) {
    return {
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol.nombre,
        permisos: usuario.rol.permisos.map((permiso) => permiso.id),
      },
    };
  }
}
