import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Linea } from '../entities/linea.entity';
import { Marca } from 'src/modules/marcas/entities/marca.entity';
import { ILineaRepository } from './lineas-repository.interface';
import { CreateLineaDto } from '../dto/create-linea.dto';

@Injectable()
export class LineaRepository implements ILineaRepository {
  constructor(
    @InjectRepository(Linea)
    private readonly lineaRepository: Repository<Linea>,
  ) {}


  async create(createLineaDto: CreateLineaDto): Promise<Linea> {
    try {
      const linea = this.lineaRepository.create({
        nombre: createLineaDto.nombre,
        descripcion: createLineaDto.descripcion, 
      });
      await this.lineaRepository.save(linea);

      return linea;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear la línea: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<Linea | null> {
    try {
      return await this.lineaRepository.findOne({
        where: { id },
        relations: ['marcas','productos'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding line with ID ${id}: ${error.message}`,
      );
    }
  }

  async añadirMarca(linea: Linea, marca: Marca): Promise<Linea> {
    try {
      linea.marcas.push(marca);
      return await this.lineaRepository.save(linea);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error vinculando la marca con la linea: ${error.message}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.lineaRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error eliminando la marca con ID ${id}: ${error.message}`,
      );
    }
  }
  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{
    lineas: Linea[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    try {
      const query = this.lineaRepository
        .createQueryBuilder('linea')
        .orderBy('linea.nombre', 'ASC')
        .skip((page - 1) * limit)
        .take(limit);

      const [lineas, total] = await query.getManyAndCount();

      return {
        lineas,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al encontrar las líneas paginadas: ${error.message}`,
      );
    }
  }
  async findLineasPorMarca(marcaId: number): Promise<Linea[]> {
    try {
      return await this.lineaRepository
        .createQueryBuilder('linea')
        .innerJoin('linea.marcas', 'marca')
        .where('marca.id = :marcaId', { marcaId })
        .orderBy('linea.nombre', 'ASC')
        .getMany();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener líneas de la marca ${marcaId}: ${error.message}`,
      );
    }
  }
  
}
