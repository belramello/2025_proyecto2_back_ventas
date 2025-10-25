import { ApiProperty } from "@nestjs/swagger";

export class RespuestaMarcaDto {

  @ApiProperty({ example: 1, description: 'Identificador único de la marca' })
  id: number;

  @ApiProperty({ example: 'Faber Castell' })
  nombre: string;
}