import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
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
import { PaginationLineaDto } from './dto/pagination.dto';
import { RespuestaFindAllPaginatedLineasDTO } from './dto/respuesta-find-all-lineas-paginated.dto';

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
    try {
      const lineaCreada = await this.lineaRepository.create(dto);
      return this.lineaMapper.toRespuestaLineaDto(lineaCreada);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear la línea: ${error.message}`,
      );
    }
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

  async findAllPaginated(
      paginationDto: PaginationLineaDto,
    ): Promise<RespuestaFindAllPaginatedLineasDTO> {
      const { limit = 10, page = 1 } = paginationDto;
      return this.lineaMapper.toRespuestaFindAllPaginatedLineasDTO(
        await this.lineaRepository.findAllPaginated(page, limit),
      );
  }


  async delete(id: number): Promise<void> {
    const linea = await this.lineaValidator.validateLineaExistente(id);
    await this.lineaValidator.validateLineaNoVinculadaAProductos(linea);
    await this.lineaRepository.delete(linea.id);
  }
}
