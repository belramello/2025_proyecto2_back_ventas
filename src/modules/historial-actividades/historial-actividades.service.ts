import { Inject, Injectable } from '@nestjs/common';
import { CreateHistorialActividadesDto } from './dto/create-historial-actividades.dto';
import { HistorialActividadesMapper } from './mappers/historial.mapper';
import type { IHistorialActividadesRepository } from './repository/historial-actividades-repository.interface';
import { PaginacionDto } from './dto/Paginacion.dto';

@Injectable()
export class HistorialActividadesService {
  constructor(
    @Inject('IHistorialActividadesRepository')
    private readonly historialRepository: IHistorialActividadesRepository,
    private readonly historialMapper: HistorialActividadesMapper,
  ) {}
  async create(createHistorialActividadeDto: CreateHistorialActividadesDto) {
    const historial = await this.historialRepository.create(
      createHistorialActividadeDto,
    );
    return this.historialMapper.toRespuestaCreateDto(historial);
  }
  async findAllPaginated(paginationDto: PaginacionDto) {
    const { limit = 10, page = 1, search, action } = paginationDto;
    const paginated = await this.historialRepository.findAllPaginated(
      page,
      limit,
      search,
      action,
    );
    return this.historialMapper.toPaginatedResponse(paginated);
  }
}
