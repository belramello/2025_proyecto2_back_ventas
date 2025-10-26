import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
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

@Injectable()
export class MarcasService {
  private readonly logger = new Logger(MarcasService.name);

  constructor(
    @Inject('IMarcaRepository')
    private readonly marcaRepository: IMarcaRepository,
    private readonly marcaMapper: MarcaMapper,
    @Inject(forwardRef(() => MarcaValidator))
    private readonly marcaValidator: MarcaValidator,
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
    try {
      const marcaActual = await this.marcaRepository.findOne(id);
      if (!marcaActual) throw new BadRequestException('Marca no encontrada');

      const logoAntiguo = marcaActual.logo;
      const logoNuevo = updateMarcaDto.logo;

      if (logoNuevo && logoAntiguo && logoNuevo !== logoAntiguo) {
        try {
          const rutaLogoAntiguo = path.join(
            process.cwd(),
            'uploads',
            'logos',
            logoAntiguo,
          );
          await fs.unlink(rutaLogoAntiguo);
          this.logger.log(`Logo anterior eliminado: ${rutaLogoAntiguo}`);
        } catch (error) {
          this.logger.error(
            `No se pudo eliminar el logo anterior: ${logoAntiguo}`,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            error.stack,
          );
        }
      }

      await this.marcaRepository.update(id, updateMarcaDto);
      const marcaActualizada = await this.marcaRepository.findOne(id);
      if (!marcaActualizada)
        throw new InternalServerErrorException(
          'Error al obtener la marca actualizada',
        );

      // ✅ Registro de historial exitoso (Modificación de marca)
      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 11,
        estadoId: 1, // Exitoso
      });

      return this.marcaMapper.toResponseDto(marcaActualizada);
    } catch (error) {
      // ❌ Registro de historial fallido
      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 11,
        estadoId: 2, // Fallido
      });
      throw error;
    }
  }

  async remove(id: number, usuario: Usuario): Promise<void> {
    try {
      const marca = await this.marcaRepository.findOne(id);
      if (!marca) throw new BadRequestException('Marca no encontrada');

      await this.marcaRepository.remove(id); // Soft delete

      if (marca.logo) {
        try {
          const rutaLogo = path.join(
            process.cwd(),
            'uploads',
            'logos',
            marca.logo,
          );
          await fs.unlink(rutaLogo);
          this.logger.log(`Logo eliminado (soft delete): ${rutaLogo}`);
        } catch (error) {
          this.logger.error(
            `No se pudo eliminar el logo durante el soft delete: ${marca.logo}`,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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

  async restore(id: number): Promise<void> {
    const marca = await this.marcaRepository.findOneWithDeleted(id);
    if (!marca)
      throw new BadRequestException('Marca no encontrada o no eliminada');
    if (!marca.deletedAt)
      throw new BadRequestException('La marca no se encuentra eliminada');

    await this.marcaRepository.restore(id);
  }

  async findOneByNombre(nombre: string): Promise<Marca | null> {
    return await this.marcaRepository.findByNombre(nombre);
  }
}
