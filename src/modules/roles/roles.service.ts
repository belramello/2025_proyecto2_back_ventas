import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UpdatePermisosRolDto } from './dto/update-permisos-rol.dto';
import { CreateRolDto } from './dto/create-rol.dto';
import type { IRolesRepository } from './repositories/roles-repository.interface';
import { RolesValidator } from './helpers/roles-validator';
import { Rol } from './entities/rol.entity';

@Injectable()
export class RolesService {
  constructor(
    @Inject('IRolesRepository')
    private readonly rolesRepository: IRolesRepository,
    @Inject(forwardRef(() => RolesValidator))
    private readonly rolesValidator: RolesValidator,
  ) {}

  async create(createRolDto: CreateRolDto) {
    //Verificar que no haya otro rol con el mismo nombre cuando se crea.
    const permisos = await this.rolesValidator.validatePermisosExistentes(
      createRolDto.permisosId,
    );
    return await this.rolesRepository.create(createRolDto, permisos);
  }

  async findAll() {
    return await this.rolesRepository.findAll();
  }

  async findOne(id: number): Promise<Rol | null> {
    return await this.rolesRepository.findOne(id);
  }

  async updatePermisos(
    rolId: number,
    updatePermisosRolDto: UpdatePermisosRolDto,
  ) {
    const rol = await this.rolesValidator.validateRolExistente(rolId);
    const permisos = await this.rolesValidator.validatePermisosExistentes(
      updatePermisosRolDto.permisosId,
    );
    await this.rolesRepository.updatePermisos(rol, permisos);
  }
}
