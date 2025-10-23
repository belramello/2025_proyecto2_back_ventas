import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RolesValidator } from '../../../modules/roles/helpers/roles-validator';

@Injectable()
export class PermisosValidator {
  constructor(
    @Inject(forwardRef(() => RolesValidator))
    private readonly rolesValidator: RolesValidator,
  ) {}

  async validateRolExistente(rolId: number) {
    const rol = await this.rolesValidator.validateRolExistente(rolId);
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }
    return rol;
  }
}
