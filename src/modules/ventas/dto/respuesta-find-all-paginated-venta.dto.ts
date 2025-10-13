import { ApiProperty } from '@nestjs/swagger';
import { RespuestaFindOneVentaDto } from './respuesta-find-one-venta.dto';
import { Expose, Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class RespuestaFindAllPaginatedVentaDTO {
  @ApiProperty({
    description: 'Lista de ventas registradas',
    type: [RespuestaFindOneVentaDto],
  })
  @Type(() => RespuestaFindOneVentaDto)
  ventas: RespuestaFindOneVentaDto[];

  @ApiProperty({
    description: 'Número total de historiales disponibles para el usuario',
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
