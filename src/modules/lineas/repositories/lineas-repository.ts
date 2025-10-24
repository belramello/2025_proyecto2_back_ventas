import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Linea } from '../entities/linea.entity';
import { Marca } from 'src/modules/marcas/entities/marca.entity';
import { ILineaRepository } from './lineas-repository.interface';

@Injectable()
export class LineaRepository implements ILineaRepository {
  constructor(
    @InjectRepository(Linea)
    private readonly lineaRepository: Repository<Linea>,
  ) {}

    async create(name: string): Promise<Linea> {
        try {
        const newLinea = this.lineaRepository.create({ nombre: name });
        return await this.lineaRepository.save(newLinea);
        } catch (error) {
        throw new InternalServerErrorException(
            `Error creating line: ${error.message}`,
        );
        }
    }

    async findById(id: number): Promise<Linea | null> {
        try {
        return await this.lineaRepository.findOne({ where: { id } });
        } catch (error) {
        throw new InternalServerErrorException(
            `Error finding line with ID ${id}: ${error.message}`,
        );
        }
    }

    async findWithBrands(id: number): Promise<Linea | null> {
        try {
        return await this.lineaRepository.findOne({
            where: { id },
            relations: ['marcas'],
        });
        } catch (error) {
        throw new InternalServerErrorException(
            `Error loading line with brands: ${error.message}`,
        );
        }
    }

    async addBrand(linea: Linea, marca: Marca): Promise<Linea> {
        try {
        const alreadyLinked = linea.marcas.some((m) => m.id === marca.id);
        if (alreadyLinked) {
            throw new BadRequestException('Brand is already linked to this line');
        }

        linea.marcas.push(marca);
        return await this.lineaRepository.save(linea);
        } catch (error) {
        throw new InternalServerErrorException(
            `Error linking brand to line: ${error.message}`,
        );
        }
    }

    async delete(id: number): Promise<void> {
        try {
        await this.lineaRepository.delete(id);
        } catch (error) {
        throw new InternalServerErrorException(
            `Error deleting line with ID ${id}: ${error.message}`,
        );
        }
    }
}
