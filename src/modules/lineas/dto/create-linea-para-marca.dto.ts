import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLineaDtoParaMarca {
  @ApiProperty({ example: 'Lapiceras', description: 'Nombre de la linea' })
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

  @ApiProperty({
    example: 1,
    description: 'ID de la marca asociada a la línea',
  })
  @IsNumber()
  marcaId: number;
}
