import { InjectRepository } from '@nestjs/typeorm';
import { IPermisosRepository } from './permisos-repository.interface';
import { Permiso } from '../entities/permiso.entity';
import { Repository } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermisoDto } from '../dto/create-permiso.dto';

export class PermisosRepository implements IPermisosRepository {
  constructor(
    @InjectRepository(Permiso)
    private readonly permisosRepository: Repository<Permiso>,
  ) {}

  async create(createPermisoDto: CreatePermisoDto): Promise<Permiso> {
    try {
      const permiso = this.permisosRepository.create({
        ...createPermisoDto,
      });
      return await this.permisosRepository.save(permiso);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear el permiso: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Permiso[]> {
    try {
      return await this.permisosRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al encontrar todos los permisos: ${error.message}`,
      );
    }
  }

  async findAllByRol(rolId: number): Promise<Permiso[]> {
    try {
      const permisos = await this.permisosRepository
        .createQueryBuilder('permiso')
        .innerJoin('permiso.roles', 'rol', 'rol.id = :rolId', { rolId })
        .getMany();

      if (!permisos || permisos.length === 0) {
        throw new NotFoundException(
          `No se encontraron permisos para el rol con ID ${rolId}`,
        );
      }
      return permisos;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al encontrar todos los permisos de un rol: ${error.message}`,
      );
    }
  }

  async findOne(rolId: number): Promise<Permiso | null> {
    try {
      const permiso = await this.permisosRepository.findOne({
        where: { id: rolId },
      });
      return permiso;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al encontrar un permiso de un rol: ${error.message}`,
      );
    }
  }
}
