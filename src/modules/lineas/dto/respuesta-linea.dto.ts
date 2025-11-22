import { ApiProperty } from '@nestjs/swagger';

export class RespuestaLineaDto {
  @ApiProperty({ example: 1, description: 'Identificador único de la linea' })
  id: number;

  @ApiProperty({ example: 'Lapiceras' })
  nombre: string;

  @ApiProperty({ example: 'Línea de lapiceras y bolígrafos de uso diario' })
  descripcion?: string;
  
}
