import { Injectable } from '@nestjs/common';
import { Linea } from '../entities/linea.entity';
import { RespuestaLineaDto } from '../dto/respuesta-linea.dto';

@Injectable()
export class LineaMapper {
  toRespuestaLineaDto(linea: Linea): RespuestaLineaDto {
    return {
      id: linea.id,
      nombre: linea.nombre,
    };
  }

  toDtos(lineas: Linea[]): RespuestaLineaDto[] {
    return lineas.map((linea) => this.toRespuestaLineaDto(linea));
  }
}
