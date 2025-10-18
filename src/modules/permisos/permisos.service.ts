import { Inject, Injectable } from '@nestjs/common';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import type { IPermisosRepository } from './repositories/permisos-repository.interface';
import { Permiso } from './entities/permiso.entity';
import { PermisosValidator } from './helpers/permisos-validator';

@Injectable()
export class PermisosService {
  constructor(
    @Inject('IPermisosRepository')
    private readonly permisosRepository: IPermisosRepository,
    private readonly permisosValidator: PermisosValidator,
  ) {}
  async create(createPermisoDto: CreatePermisoDto) {
    return await this.permisosRepository.create(createPermisoDto);
  }

  async findAll() {
    return await this.permisosRepository.findAll();
  }

  async findOne(id: number): Promise<Permiso | null> {
    return await this.permisosRepository.findOne(id);
  }

  async findAllByRol(rolId: number): Promise<Permiso[]> {
    await this.permisosValidator.validateRolExistente(rolId);
    return await this.permisosRepository.findAllByRol(rolId);
  }
}
