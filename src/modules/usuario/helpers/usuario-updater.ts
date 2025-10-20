import { Injectable } from '@nestjs/common';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { Usuario } from '../entities/usuario.entity';
import { hashPassword } from 'src/modules/auth/helpers/password-helper';

@Injectable()
export class UsuarioUpdater {
  async aplicarActualizaciones(
    usuario: Usuario,
    dto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    if (dto.nombre !== undefined) usuario.nombre = dto.nombre;
    if (dto.apellido !== undefined) usuario.apellido = dto.apellido;
    if (dto.email !== undefined) usuario.email = dto.email;
    if (dto.password) usuario.password = await hashPassword(dto.password);
    //rol se asigna desde el servicio (lado propietario) después de validar
    return usuario;
  }
}
