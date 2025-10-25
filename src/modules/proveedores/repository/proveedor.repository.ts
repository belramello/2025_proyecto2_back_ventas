import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { Proveedor } from '../entities/proveedore.entity';
import { IProveedoresRepository } from './proveedor-interface.repository';
import { CreateProveedoreDto } from '../dto/create-proveedore.dto';
import { FindOneProveedoreDto } from '../dto/findOne-proveedore.dto';
import { DeleteProveedoreDto } from '../dto/delete-proveedore.dto';

export class ProveedoresRepository implements IProveedoresRepository {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
  ) {}

  async create(createProveedorDto: CreateProveedoreDto): Promise<Proveedor> {
    try {
      const proveedor = this.proveedorRepository.create({
        ...createProveedorDto,
      });
      return await this.proveedorRepository.save(proveedor);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear el proveedor: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Proveedor[]> {
    try {
      return await this.proveedorRepository.find({
        where: { fechaEliminacion: IsNull() },
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener los proveedores: ${error.message}`,
      );
    }
  }

  async findOne(data: FindOneProveedoreDto): Promise<Proveedor | null> {
    try {
      const proveedor = await this.proveedorRepository.findOne({
        where: { id: data.id },
      });
      return proveedor;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al buscar el proveedor con ID ${data.id}: ${error.message}`,
      );
    }
  }

  async findByNombre(nombre: string): Promise<Proveedor | null> {
    try {
      return await this.proveedorRepository
        .createQueryBuilder('proveedor')
        .where('proveedor.nombre = :nombre', { nombre })
        .andWhere('proveedor.fechaEliminacion IS NULL')
        .getOne();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al buscar el proveedor con nombre ${nombre}: ${error.message}`,
      );
    }
  }

  async remove(deleteProveedorDto: DeleteProveedoreDto): Promise<UpdateResult> {
    try {
      return await this.proveedorRepository.update(deleteProveedorDto.id, {
        fechaEliminacion: new Date(),
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al eliminar (soft delete) el proveedor con ID ${deleteProveedorDto.id}: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{
    proveedores: Proveedor[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    try {
      const query = this.proveedorRepository
        .createQueryBuilder('proveedor')
        .where('proveedor.fechaEliminacion IS NULL')
        .orderBy('proveedor.nombre', 'ASC')
        .skip((page - 1) * limit)
        .take(limit);

      const [proveedores, total] = await query.getManyAndCount();

      return {
        proveedores,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al encontrar los proveedores paginados: ${error.message}`,
      );
    }
  }
}
