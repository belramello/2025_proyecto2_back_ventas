import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Rol } from '../../../modules/roles/entities/rol.entity';
import { RolesService } from '../../../modules/roles/roles.service';
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

  async validateEmailDisponible(
    email?: string,
    existingUserId?: number,
  ): Promise<void> {
    if (!email) return;
    const existente = await this.usuariosService.findByEmail(email);
    if (existente && existente.id !== existingUserId) {
      throw new BadRequestException('El email ya está en uso por otro usuario');
    }
  }
}
