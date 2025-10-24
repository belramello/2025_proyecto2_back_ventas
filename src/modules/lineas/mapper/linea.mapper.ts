import { Injectable } from '@nestjs/common';
import { Linea } from '../entities/linea.entity';
import { RespuestaLineaDto } from '../dto/respuesta-linea.dto';

@Injectable()
export class LineaMapper {
  toDto(linea: Linea): RespuestaLineaDto {
    return {
      nombre: linea.nombre,
      marcas: linea.marcas?.map(m => m.nombre) ?? [],
    };
  }

  toDtos(lineas: Linea[]): RespuestaLineaDto[] {
    return lineas.map((linea) => this.toDto(linea));
  }
}
