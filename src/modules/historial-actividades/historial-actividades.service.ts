import { Inject, Injectable } from '@nestjs/common';
import { CreateHistorialActividadesDto } from './dto/create-historial-actividade.dto';
import { PaginationDto } from '../ventas/dto/pagination.dto';
import { HistorialActividadesMapper } from './mappers/historial.mapper';
import type { IHistorialActividadesRepository } from './repository/historial-actividades-repository.interface';

@Injectable()
export class HistorialActividadesService {
  constructor(
    @Inject('IHistorialActividadesRepository')
    private readonly historialRepository: IHistorialActividadesRepository, 
    private readonly historialMapper: HistorialActividadesMapper ) {}
  async create(createHistorialActividadeDto: CreateHistorialActividadesDto) {
  const historial = await this.historialRepository.create(createHistorialActividadeDto);
  return this.historialMapper.toRespuestaCreateDto(historial);
}
  async findAllPaginated(paginationDto: PaginationDto) {
  const { limit = 10, page = 1 } = paginationDto;
  const paginated = await this.historialRepository.findAllPaginated(page, limit);
  return this.historialMapper.toPaginatedResponse(paginated);
}
}
