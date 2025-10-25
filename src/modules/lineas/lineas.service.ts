import {
  forwardRef,
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
import { LineasValidator } from './helpers/lineas-validator';
import { MarcaValidator } from '../marcas/helpers/marcas-validator';

@Injectable()
export class LineasService {
  constructor(
    @Inject('ILineaRepository')
    private readonly lineaRepository: ILineaRepository,
    private readonly lineaMapper: LineaMapper,
    @Inject(forwardRef(() => LineasValidator))
    private readonly lineaValidator: LineasValidator,
    @Inject(forwardRef(() => MarcaValidator))
    private readonly marcaValidator: MarcaValidator,
  ) {}

  async createLinea(dto: CreateLineaDto): Promise<RespuestaLineaDto> {
    const linea = await this.lineaRepository.create(dto.nombre);
    return this.lineaMapper.toRespuestaLineaDto(linea);
  }

  async findLinea(id: number): Promise<RespuestaLineaDto> {
    const linea = await this.lineaRepository.findOne(id);
    if (!linea) throw new NotFoundException('Linea no encontrada');
    return this.lineaMapper.toRespuestaLineaDto(linea);
  }

  async findOne(id: number): Promise<Linea | null> {
    return await this.lineaRepository.findOne(id);
  }

  async agregarMarcaALinea(
    dto: AddMarcaToLineaDto,
  ): Promise<RespuestaLineaDto> {
    const linea = await this.lineaValidator.validateLineaExistente(dto.lineaId);
    const marca = await this.marcaValidator.validateExistencia(dto.marcaId);
    await this.lineaValidator.validateLineaNoVinculadaAMarca(linea, marca);
    const updated = await this.lineaRepository.añadirMarca(linea, marca);
    return this.lineaMapper.toRespuestaLineaDto(updated);
  }

  //Agregar validación que no se pueda borrar lineas si están actualmente vinculadas a un producto.
  async delete(id: number): Promise<void> {
    const linea = await this.lineaValidator.validateLineaExistente(id);
    await this.lineaRepository.delete(linea.id);
  }
}
