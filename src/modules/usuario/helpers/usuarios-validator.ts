import { Injectable, NotFoundException } from '@nestjs/common';
import { Rol } from 'src/modules/roles/entities/rol.entity';
import { RolesService } from 'src/modules/roles/roles.service';

@Injectable()
export class UsuariosValidator {
  constructor(private readonly rolesService: RolesService) {}

  async validateRolExistente(rolId: number): Promise<Rol> {
    const rol = await this.rolesService.findOne(rolId);
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${rolId} no encontrado`);
    }
    return rol;
  }
}
