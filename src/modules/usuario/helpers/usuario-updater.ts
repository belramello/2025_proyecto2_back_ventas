import { Injectable } from '@nestjs/common';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { Usuario } from '../entities/usuario.entity';
import { hashPassword } from 'src/modules/auth/helpers/password-helper';
import { UsuariosValidator } from './usuarios-validator';

@Injectable()
export class UsuarioUpdater {
  constructor(private readonly usuariosValidator: UsuariosValidator) {}

  async aplicarActualizaciones(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await this.usuariosValidator.validateUsuarioExistente(id);
    // validar email disponible (si se envió)
    await this.usuariosValidator.validateEmailDisponible(
      updateUsuarioDto.email,
      id,
    );
    // Si envían rolId, validar y asignar
    if (updateUsuarioDto.rolId !== undefined) {
      const rol = await this.usuariosValidator.validateRolExistente(
        updateUsuarioDto.rolId,
      );
      usuario.rol = rol;
    }
    if (updateUsuarioDto.nombre !== undefined)
      usuario.nombre = updateUsuarioDto.nombre;
    if (updateUsuarioDto.apellido !== undefined)
      usuario.apellido = updateUsuarioDto.apellido;
    if (updateUsuarioDto.email !== undefined)
      usuario.email = updateUsuarioDto.email;
    if (updateUsuarioDto.password)
      usuario.password = await hashPassword(updateUsuarioDto.password);
    return usuario;
  }
}
