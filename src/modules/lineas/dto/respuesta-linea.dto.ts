import { ApiProperty } from '@nestjs/swagger';

export class RespuestaLineaDto {
  @ApiProperty({ example: 'Lapiceras' })
  nombre: string;

  @ApiProperty({ example: ['Faber Castell', 'Bic'], type: [String] })
  marcas: string[];
}
