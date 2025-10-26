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

@Injectable()
export class MarcasService {
  private readonly logger = new Logger(MarcasService.name);

  constructor(
    @Inject('IMarcaRepository')
    private readonly marcaRepository: IMarcaRepository,
    private readonly marcaMapper: MarcaMapper,
    @Inject(forwardRef(() => MarcaValidator))
    private readonly marcaValidator: MarcaValidator,
  ) {}

  async create(createMarcaDto: CreateMarcaDto): Promise<MarcaResponseDto> {
    await this.marcaValidator.validateNombreUnico(createMarcaDto.nombre);
    const lineas = await this.marcaValidator.validateLineasExistentes(
      createMarcaDto.lineasId,
    );
    const nuevaMarca = await this.marcaRepository.create(
      createMarcaDto,
      lineas,
    );
    return this.marcaMapper.toResponseDto(nuevaMarca);
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

  async update(
    id: number,
    updateMarcaDto: UpdateMarcaDto,
  ): Promise<MarcaResponseDto> {
    const marcaActual = await this.marcaRepository.findOne(id);
    if (!marcaActual) throw new BadRequestException('Marca no encontrada');

    // Validación de nombre único (manejada por DTO/Validator)

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
    return this.marcaMapper.toResponseDto(marcaActualizada);
  }

  async remove(id: number): Promise<void> {
    const marca = await this.marcaRepository.findOne(id);
    if (!marca) throw new BadRequestException('Marca no encontrada');

    // TODO: Chequeo de productos asociados

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
          error.stack,
        );
      }
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
