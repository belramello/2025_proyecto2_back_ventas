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
import { RespuestaFindAllLineasAsociadasAMarcaDTO } from './dto/respuesta-linea-marca.dto';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';
import { Usuario } from '../usuario/entities/usuario.entity';
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
    private readonly historialActividades: HistorialActividadesService,
  ) {}

  async createLinea(
    dto: CreateLineaDto,
    usuario: Usuario,
  ): Promise<RespuestaLineaDto> {
    try {
      const lineaCreada = await this.lineaRepository.create(dto);

      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 10,
        estadoId: 1,
      });

      return this.lineaMapper.toRespuestaLineaDto(lineaCreada);
    } catch (error) {
      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 10,
        estadoId: 2,
      });
      throw error;
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
    usuario: Usuario,
  ): Promise<RespuestaLineaDto> {
    const accionId = 11;
    try {
      const linea = await this.lineaValidator.validateLineaExistente(
        dto.lineaId,
      );
      const marca = await this.marcaValidator.validateExistencia(dto.marcaId);
      await this.lineaValidator.validateLineaNoVinculadaAMarca(linea, marca);
      const updated = await this.lineaRepository.añadirMarca(linea, marca);

      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: accionId,
        estadoId: 1,
      });

      return this.lineaMapper.toRespuestaLineaDto(updated);
    } catch (error) {
      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: accionId,
        estadoId: 2,
      });
      throw error;
    }
  }

  async delete(id: number, usuario: Usuario): Promise<void> {
    const accionId = 12;
    try {
      const linea = await this.lineaValidator.validateLineaExistente(id);
      await this.lineaRepository.delete(linea.id);

      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: accionId,
        estadoId: 1,
      });
    } catch (error) {
      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: accionId,
        estadoId: 2,
      });
      throw error;
    }
  }

  async obtenerLineasAsociadasAMarca(
    marcaId: number,
  ): Promise<RespuestaFindAllLineasAsociadasAMarcaDTO> {
    const marca = await this.marcaValidator.validateExistencia(marcaId);
    const lineas = await this.lineaRepository.findLineasPorMarca(marca.id);

    return {
      marcaId: marca.id,
      lineas: lineas.map((linea) =>
        this.lineaMapper.toRespuestaLineaDto(linea),
      ),
    };
  }
  async findAllPaginated(
    paginationDto: PaginationLineaDto,
  ): Promise<RespuestaFindAllPaginatedLineasDTO> {
    const { limit = 10, page = 1 } = paginationDto;
    return this.lineaMapper.toRespuestaFindAllPaginatedLineasDTO(
      await this.lineaRepository.findAllPaginated(page, limit),
    );
  }
}
