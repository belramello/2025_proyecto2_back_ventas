import { InjectRepository } from '@nestjs/typeorm';
import { IRolesRepository } from './roles-repository.interface';
import { Rol } from '../entities/rol.entity';
import { Repository } from 'typeorm';
import { CreateRolDto } from '../dto/create-rol.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Permiso } from 'src/modules/permisos/entities/permiso.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';

export class RolesRepository implements IRolesRepository {
  constructor(
    @InjectRepository(Rol)
    private readonly rolesRepository: Repository<Rol>,
  ) {}

  async create(createRolDto: CreateRolDto, permisos: Permiso[]): Promise<Rol> {
    try {
      const rol = this.rolesRepository.create({
        ...createRolDto,
      });
      if (permisos && permisos.length > 0) {
        rol.permisos = permisos;
      }
      return await this.rolesRepository.save(rol);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear el rol: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Rol[]> {
    try {
      return await this.rolesRepository.find({ relations: ['permisos'] });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener roles: ${error.message}`,
      );
    }
  }

  async findOne(rolId: number): Promise<Rol | null> {
    try {
      const rol = await this.rolesRepository.findOne({
        where: { id: rolId },
        relations: ['permisos'],
      });
      return rol;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener el rol con ID ${rolId}: ${error.message}`,
      );
    }
  }

  async updatePermisos(rol: Rol, permisos: Permiso[]): Promise<void> {
    try {
      rol.permisos = permisos;
      await this.rolesRepository.save(rol);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar permisos del rol: ${error.message}`,
      );
    }
  }
}
