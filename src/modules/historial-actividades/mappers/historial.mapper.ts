import { Injectable } from '@nestjs/common';
import { HistorialActividades } from '../entities/historial-actividade.entity';
import { RespuestaFindAllPaginatedHistorialDTO } from '../dto/RespuestaFindAllPaginatedHistorial.dto';
import { RespuestaCreateHistorialDto } from '../dto/respuesta-create-historial.dto';

@Injectable()
export class HistorialActividadesMapper {
  toResponse(historial: HistorialActividades) {
    return {
      id: historial.id,
      usuario: historial.usuario,
      accion: historial.accion,
      fechaHora: historial.fechaHora,
      estado: historial.estado,
    };
  }

  toRespuestaCreateDto(
    historial: HistorialActividades,
  ): RespuestaCreateHistorialDto {
    return {
      id: historial.id,
      usuario: historial.usuario,
      accion:
        historial.accion instanceof Object
          ? historial.accion.nombre
          : historial.accion,
      fechaHora: historial.fechaHora,
      estado:
        historial.estado instanceof Object
          ? historial.estado.nombre
          : historial.estado,
    };
  }

  toPaginatedResponse(paginated: {
    historial: HistorialActividades[];
    total: number;
    page: number;
    lastPage: number;
  }): RespuestaFindAllPaginatedHistorialDTO {
    return {
      data: paginated.historial.map((h) => this.toResponse(h)),
      total: paginated.total,
      page: paginated.page,
      lastPage: paginated.lastPage,
    };
  }
}
