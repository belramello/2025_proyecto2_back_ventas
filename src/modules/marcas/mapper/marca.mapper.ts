import { Injectable } from '@nestjs/common';
import { Marca } from '../entities/marca.entity';
import { RespuestaMarcaDto } from '../dto/respuesta-marca.dto';

@Injectable()
export class MarcaMapper {

  toDto(marca: Marca): RespuestaMarcaDto {
    return {

      nombre: marca.nombre,
    };
  }


  toDtos(marcas: Marca[]): RespuestaMarcaDto[] {
    return marcas.map((marca) => this.toDto(marca));
  }
}
