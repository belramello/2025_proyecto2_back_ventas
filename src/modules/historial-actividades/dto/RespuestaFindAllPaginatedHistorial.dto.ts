import { ApiProperty } from '@nestjs/swagger';
import { HistorialActividades } from '../entities/historial-actividade.entity';
import { Type } from 'class-transformer';

export class RespuestaFindAllPaginatedHistorialDTO {
  @ApiProperty({ type: [HistorialActividades] })
  @Type(() => HistorialActividades)
  data: HistorialActividades[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  lastPage: number;
}
