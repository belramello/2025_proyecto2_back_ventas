import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import type { IMarcaRepository } from './repositories/marca-repository.interface';
import { PaginationDto } from './dto/pagination.dto';
import { RespuestaFindAllPaginatedMarcasDTO } from './dto/respuesta-find-all-paginated-marcas.dto';
import { MarcaMapper } from './mapper/marca.mapper';
import { MarcaResponseDto } from './dto/marca-response.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { MarcaValidator } from './helpers/marcas-validator';
import { Marca } from './entities/marca.entity';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';
import { Usuario } from '../usuario/entities/usuario.entity';
import { MarcasUpdater } from './helpers/marcas-updater';

@Injectable()
export class MarcasService {
  private readonly logger = new Logger(MarcasService.name);

  constructor(
    @Inject('IMarcaRepository')
    private readonly marcaRepository: IMarcaRepository,
    private readonly marcaMapper: MarcaMapper,
    @Inject(forwardRef(() => MarcaValidator))
    private readonly marcaValidator: MarcaValidator,
    @Inject(forwardRef(() => MarcasUpdater))
    private readonly marcaUpdater: MarcasUpdater,
    private readonly historialActividades: HistorialActividadesService,
  ) {}

  async create(
    createMarcaDto: CreateMarcaDto,
    usuario: Usuario,
  ): Promise<MarcaResponseDto> {
    try {
      await this.marcaValidator.validateNombreUnico(createMarcaDto.nombre);
      const lineas = await this.marcaValidator.validateLineasExistentes(
        createMarcaDto.lineasId,
      );
      const nuevaMarca = await this.marcaRepository.create(
        createMarcaDto,
        lineas,
      );

      // ✅ Registro de historial exitoso (Creación de marca)
      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 10,
        estadoId: 1, // Exitoso
      });

      return this.marcaMapper.toResponseDto(nuevaMarca);
    } catch (error) {
      // ❌ Registro de historial fallido
      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 10,
        estadoId: 2, // Fallido
      });
      throw error;
    }
  }

  async findAllPaginated(
    paginationDto: PaginationDto,
  ): Promise<RespuestaFindAllPaginatedMarcasDTO> {
    const paginatedResult =
      await this.marcaRepository.findAllPaginated(paginationDto);
    return this.marcaMapper.toRespuestaFindAllPaginatedMarcasDTO(
      paginatedResult,
    );
  }

  async findOne(id: number): Promise<MarcaResponseDto> {
    const marca = await this.marcaRepository.findOne(id);
    if (!marca) throw new BadRequestException('Marca no encontrada');
    return this.marcaMapper.toResponseDto(marca);
  }

  async findOneForServices(id: number): Promise<Marca | null> {
    return this.marcaRepository.findOne(id);
  }

  async update(
    id: number,
    updateMarcaDto: UpdateMarcaDto,
    usuario: Usuario,
  ): Promise<MarcaResponseDto> {
    const marca = await this.marcaValidator.validateExistencia(id);
    const marcaAActualizar = await this.marcaUpdater.updateMarca(
      marca,
      updateMarcaDto,
    );
    const marcaActualizada =
      await this.marcaRepository.update(marcaAActualizar);
    return this.marcaMapper.toResponseDto(marcaActualizada);
  }

  async remove(id: number, usuario: Usuario): Promise<void> {
    try {
      const marca = await this.marcaValidator.validateExistencia(id);
      await this.marcaRepository.remove(id);
      if (marca.logo) {
        try {
          const rutaLogo = path.join(
            process.cwd(),
            'uploads',
            'logos',
            marca.logo,
          );
          await fs.unlink(rutaLogo);
        } catch (error) {
          this.logger.error(
            `No se pudo eliminar el logo durante el soft delete: ${marca.logo}`,
            error.stack,
          );
        }
      }
      // ✅ Registro de historial exitoso (Eliminación de marca)
      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 12,
        estadoId: 1, // Exitoso
      });
    } catch (error) {
      // ❌ Registro de historial fallido
      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 12,
        estadoId: 2, // Fallido
      });
      throw error;
    }
  }
  async findOneByNombre(nombre: string): Promise<Marca | null> {
    return await this.marcaRepository.findByNombre(nombre);
  }
}
