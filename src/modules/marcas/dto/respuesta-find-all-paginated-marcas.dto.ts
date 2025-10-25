import { ApiProperty } from '@nestjs/swagger';
import { MarcaResponseDto } from './marca-response.dto';
export class RespuestaFindAllPaginatedMarcasDTO {
  @ApiProperty({ type: [MarcaResponseDto] }) 
  marcas: MarcaResponseDto[];


  @ApiProperty({ example: 100, description: 'Total de marcas encontradas' })
  total: number;

  @ApiProperty({ example: 1, description: 'Página actual' })
  page: number;

  @ApiProperty({ example: 10, description: 'Última página disponible' })
  lastPage: number;
}