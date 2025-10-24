import { ApiProperty } from "@nestjs/swagger";

export class RespuestaMarcaDto {


  @ApiProperty({ example: 'Pedigree' })
  nombre: string;
}