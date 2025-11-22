import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { RespuestaLineaDto } from './respuesta-linea.dto';

export class RespuestaFindAllLineasAsociadasAMarcaDTO {

 @ApiProperty({
    description: 'Número de la página actual',
    type: Number,
    example: 1,
  })
    @IsInt({ message: 'La página debe ser un número entero' })
    marcaId: number;

  @ApiProperty({
    description: 'Lista de usuarios registradas',
    type: [RespuestaLineaDto],
  })
  @Type(() => RespuestaLineaDto)
  lineas: RespuestaLineaDto[];

 
}
