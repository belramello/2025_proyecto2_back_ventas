/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, UpdateResult } from 'typeorm';
import { Marca } from '../entities/marca.entity';
import { IMarcaRepository } from './marca-repository.interface';
import { CreateMarcaDto } from '../dto/create-marca.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { Linea } from '../../../modules/lineas/entities/linea.entity';

@Injectable()
export class MarcaRepository implements IMarcaRepository {
  constructor(
    @InjectRepository(Marca)
    private readonly marcaRepository: Repository<Marca>,
  ) {}

  async create(
    createMarcaDto: CreateMarcaDto,
    lineas: Linea[],
  ): Promise<Marca> {
    try {
      const marca = this.marcaRepository.create({ ...createMarcaDto, lineas });
      return await this.marcaRepository.save(marca);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear la marca: ${error.message}`,
      );
    }
  }

  async findAllPaginated(paginationDto: PaginationDto): Promise<{
    marcas: Marca[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    try {
      const query = this.marcaRepository
        .createQueryBuilder('marca')
        .where('marca.deletedAt IS NULL')
        .orderBy('marca.nombre', 'ASC')
        .skip(skip)
        .take(limit);

      const [marcas, total] = await query.getManyAndCount();

      return {
        marcas,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al encontrar las marcas paginadas: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<Marca | null> {
    try {
      return await this.marcaRepository.findOne({
        where: { id, deletedAt: IsNull() },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al buscar la marca con ID ${id}: ${error.message}`,
      );
    }
  }

  async findOneWithDeleted(id: number): Promise<Marca | null> {
    try {
      return await this.marcaRepository.findOne({
        where: { id },
        withDeleted: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al buscar la marca con ID ${id} (incluyendo borrados): ${error.message}`,
      );
    }
  }

  async findByNombre(nombre: string): Promise<Marca | null> {
    try {
      return await this.marcaRepository.findOneBy({
        nombre,
        deletedAt: IsNull(),
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al buscar la marca con nombre ${nombre}: ${error.message}`,
      );
    }
  }

  async update(marca: Marca): Promise<Marca> {
    try {
      return await this.marcaRepository.save(marca);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar la marca con ID ${marca.id}: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<UpdateResult> {
    try {
      return await this.marcaRepository.softDelete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al eliminar (soft delete) la marca con ID ${id}: ${error.message}`,
      );
    }
  }
}
