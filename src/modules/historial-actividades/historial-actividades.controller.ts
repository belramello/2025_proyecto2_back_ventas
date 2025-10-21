import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { HistorialActividadesService } from './historial-actividades.service';
import { CreateHistorialActividadesDto } from './dto/create-historial-actividade.dto';
import { PaginationDto } from '../ventas/dto/pagination.dto';
import { RespuestaFindAllPaginatedHistorialDTO } from './dto/RespuestaFindAllPaginatedHistorial.dto';

@Controller('historial-actividades')
export class HistorialActividadesController {
  constructor(
    private readonly historialActividadesService: HistorialActividadesService,
  ) {}

  @Post()
  create(@Body() createHistorialActividadeDto: CreateHistorialActividadesDto) {
    return this.historialActividadesService.create(
      createHistorialActividadeDto,
    );
  }

  @Get()
  findAllPaginated(
    @Query() paginationDto: PaginationDto,
  ): Promise<RespuestaFindAllPaginatedHistorialDTO> {
    return this.historialActividadesService.findAllPaginated(paginationDto);
  }
}
