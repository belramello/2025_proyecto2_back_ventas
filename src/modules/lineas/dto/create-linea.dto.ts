
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, } from 'class-validator';

export class CreateLineaDto {

  @ApiProperty({example: 'Lapiceras',description: 'Nombre de la linea',})
  @IsString()
  nombre: string;

  @ApiProperty({
    example: 'Línea de lapiceras y bolígrafos de uso diario',
    description: 'Descripción opcional de la línea',
    required: false, 
  })
  @IsOptional()
  @IsString()
  descripcion?: string;
}


