import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLineaDto } from './dto/create-linea.dto';
import { AddMarcaToLineaDto } from './dto/add-marca-to-linea.dto';
import { RespuestaLineaDto } from './dto/respuesta-linea.dto';
import { LineaMapper } from './mapper/linea.mapper';
import type { ILineaRepository } from './repositories/lineas-repository.interface';
import { Linea } from './entities/linea.entity';
import { MarcasService } from '../marcas/marcas.service';

@Injectable()
export class LineasService {
  constructor(
    @Inject('ILineaRepository')
    private readonly lineaRepository: ILineaRepository,
    private readonly lineaMapper: LineaMapper,
    private readonly marcaService: MarcasService,
  ) {}

  async createLinea(dto: CreateLineaDto): Promise<RespuestaLineaDto> {
    const linea = await this.lineaRepository.create(dto.nombre);
    return this.lineaMapper.toDto(linea);
  }

  async findLinea(id: number): Promise<RespuestaLineaDto> {
    const linea = await this.lineaRepository.findWithBrands(id);
    if (!linea) {
      throw new NotFoundException('Line not found');
    }
    return this.lineaMapper.toDto(linea);
  }

  async findOne(id: number): Promise<Linea | null> {
    return await this.lineaRepository.findById(id);
  }

  async addBrandToLinea(dto: AddMarcaToLineaDto): Promise<RespuestaLineaDto> {
    const lineaId = Number(dto.lineaId);
    if (isNaN(lineaId)) {
      throw new BadRequestException('Invalid lineaId');
    }

    const linea = await this.lineaRepository.findWithBrands(lineaId);
    if (!linea) {
      throw new NotFoundException('Line not found');
    }

    const marca = await this.marcaService.findOneForServices(dto.marcaId);
    if (!marca) {
      throw new NotFoundException('Marca no encontrada');
    }
    const updated = await this.lineaRepository.addBrand(linea, marca);
    return this.lineaMapper.toDto(updated);
  }

  async delete(id: number): Promise<void> {
    const linea = await this.lineaRepository.findById(id);
    if (!linea) {
      throw new NotFoundException('Line not found');
    }

    await this.lineaRepository.delete(id);
  }
}
