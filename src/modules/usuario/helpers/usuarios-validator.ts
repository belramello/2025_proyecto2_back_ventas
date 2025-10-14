import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Rol } from 'src/modules/roles/entities/rol.entity';
import { RolesService } from 'src/modules/roles/roles.service';
import { UsuarioService } from '../usuario.service';
import { Usuario } from '../entities/usuario.entity';

@Injectable()
export class UsuariosValidator {
  constructor(
    @Inject(forwardRef(() => RolesService))
    private readonly rolesService: RolesService,
    @Inject(forwardRef(() => UsuarioService))
    private readonly usuariosService: UsuarioService,
  ) {}

  async validateRolExistente(rolId: number): Promise<Rol> {
    const rol = await this.rolesService.findOne(rolId);
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${rolId} no encontrado`);
    }
    return rol;
  }

  async validateUsuarioExistente(usuarioId: number): Promise<Usuario> {
    const usuario = await this.usuariosService.findOne(usuarioId);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }
    return usuario;
  }
}
