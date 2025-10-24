
import { ApiProperty } from '@nestjs/swagger';
import { IsString, } from 'class-validator';

export class CreateLineaDto {

  @ApiProperty({example: 'Lapiceras',description: 'Nombre de la linea',})
  @IsString()
  nombre: string;

}
