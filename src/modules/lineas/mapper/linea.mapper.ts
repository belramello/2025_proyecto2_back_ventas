import { Injectable } from '@nestjs/common';
import { Linea } from '../entities/linea.entity';
import { RespuestaLineaDto } from '../dto/respuesta-linea.dto';
import { RespuestaFindAllPaginatedLineasDTO } from '../dto/respuesta-find-all-lineas-paginated.dto';

@Injectable()
export class LineaMapper {
  toRespuestaLineaDto(linea: Linea): RespuestaLineaDto {
    return {
      id: linea.id,
      nombre: linea.nombre,
      descripcion: linea.descripcion,
    };
  }

  toDtos(lineas: Linea[]): RespuestaLineaDto[] {
    return lineas.map((linea) => this.toRespuestaLineaDto(linea));
  }

  toRespuestaFindAllLineasDTO(
  lineas: Linea[],
): RespuestaLineaDto[] {
  return lineas.map((linea) =>
    this.toRespuestaLineaDto(linea),
  );
}

toRespuestaFindAllPaginatedLineasDTO(paginated: {
  lineas: Linea[];
  total: number;
  page: number;
  lastPage: number;
}): RespuestaFindAllPaginatedLineasDTO {
  return {
    lineas: this.toRespuestaFindAllLineasDTO(paginated.lineas),
    total: paginated.total,
    page: paginated.page,
    lastPage: paginated.lastPage,
  };
}
}
