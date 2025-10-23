import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, UpdateResult } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { Marca } from '../entities/marca.entity';
import { IMarcaRepository } from './marca-repository.interface';
import { CreateMarcaDto } from '../dto/create-marca.dto';
import { UpdateMarcaDto } from '../dto/update-marca.dto';

@Injectable()
export class MarcaRepository implements IMarcaRepository {
  constructor(
    @InjectRepository(Marca)
    private readonly marcaRepository: Repository<Marca>,
  ) {}

  async create(createMarcaDto: CreateMarcaDto): Promise<Marca> {
    try {
      const marca = this.marcaRepository.create(createMarcaDto);
      return await this.marcaRepository.save(marca);
    } catch (error) {
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al crear la marca: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Marca[]> {
    try {
      return await this.marcaRepository.find({
        where: { deletedAt: IsNull() },
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al encontrar las marcas: ${error.message}`,
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al buscar la marca con ID ${id}: ${error.message}`,
      );
    }
  }

  async findByNombre(nombre: string): Promise<Marca | null> {
    try {
      return await this.marcaRepository.findOneBy({ nombre });
    } catch (error) {
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al buscar la marca con nombre ${nombre}: ${error.message}`,
      );
    }
  }

  async update(id: number, data: UpdateMarcaDto): Promise<UpdateResult> {
    try {
      return await this.marcaRepository.update(id, data);
    } catch (error) {
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al actualizar la marca con ID ${id}: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<UpdateResult> {
    try {
      return await this.marcaRepository.softDelete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al eliminar (soft delete) la marca con ID ${id}: ${error.message}`,
      );
    }
  }

  async restore(id: number): Promise<UpdateResult> {
    try {
      return await this.marcaRepository.restore(id);
    } catch (error) {
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al restaurar la marca con ID ${id}: ${error.message}`,
      );
    }
  }
}
