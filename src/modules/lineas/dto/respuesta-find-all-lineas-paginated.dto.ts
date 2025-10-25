import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { RespuestaLineaDto } from './respuesta-linea.dto';

export class RespuestaFindAllPaginatedLineasDTO {
  @ApiProperty({
    description: 'Lista de usuarios registradas',
    type: [RespuestaLineaDto],
  })
  @Type(() => RespuestaLineaDto)
  lineas: RespuestaLineaDto[];

  @ApiProperty({
    description: 'Número total de lineas registradas',
    type: Number,
    example: 3,
  })
  @IsInt({ message: 'El total debe ser un número entero' })
  total: number;

  @ApiProperty({
    description: 'Número de la página actual',
    type: Number,
    example: 1,
  })
  @IsInt({ message: 'La página debe ser un número entero' })
  page: number;

  @ApiProperty({
    description: 'Número de la última página disponible',
    type: Number,
    example: 2,
  })
  @Expose()
  @IsInt({ message: 'La última página debe ser un número entero' })
  lastPage: number;
}
