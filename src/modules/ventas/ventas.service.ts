import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { Transactional } from 'typeorm-transactional';
import { VentasMapper } from './mappers/ventas.mapper';
import { RespuestaCreateVentaDto } from './dto/respuesta-create-venta.dto';
import type { IVentasRepository } from './repositories/ventas-repository.interface';
import { RespuestaFindOneVentaDto } from './dto/respuesta-find-one-venta.dto';
import { PaginationDto } from './dto/pagination.dto';
import { RespuestaFindAllPaginatedVentaDTO } from './dto/respuesta-find-all-paginated-venta.dto';
import { Usuario } from '../usuario/entities/usuario.entity';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';

@Injectable()
export class VentasService {
  constructor(
    @Inject('IVentasRepository')
    private readonly ventasRepository: IVentasRepository,
    private readonly ventasMapper: VentasMapper,
    private readonly historialActividades: HistorialActividadesService,
  ) {}

  @Transactional()
  async create(
    createVentaDto: CreateVentaDto,
    usuario: Usuario,
  ): Promise<RespuestaCreateVentaDto> {
    try {
      const venta = await this.ventasRepository.create(createVentaDto, usuario);
      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 16,
        estadoId: 1,
      });
      return this.ventasMapper.toRespuestaCreateVentaDto(venta);
    } catch (error) {
      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 16,
        estadoId: 2,
      });
      throw error;
    }
  }

  async findAllPaginated(
    paginationDto: PaginationDto,
  ): Promise<RespuestaFindAllPaginatedVentaDTO> {
    const { limit = 10, page = 1 } = paginationDto;
    return this.ventasMapper.toRespuestaFindAllPaginatedVentaDTO(
      await this.ventasRepository.findAllPaginated(page, limit),
    );
  }

  async findOne(id: number): Promise<RespuestaFindOneVentaDto> {
    const venta = await this.ventasRepository.findOne(id);
    if (!venta) {
      throw new NotFoundException(`No se encontró la venta con ID ${id}`);
    }
    return this.ventasMapper.toRespuestaFinalFindOneDto(venta);
  }
}
