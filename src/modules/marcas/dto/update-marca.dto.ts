import { PartialType } from '@nestjs/swagger'; 
import { CreateMarcaDto } from './create-marca.dto';
import { IsOptional, IsNumber } from 'class-validator'; // 
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMarcaDto extends PartialType(CreateMarcaDto) {
  @ApiPropertyOptional({ description: 'Nuevo nombre de archivo del logo (si cambia)', example: 'logo-nuevo-123.webp', type: String })
  logo?: string;

  // ID opcional para que el validador sepa qué ID ignorar.
  // No necesita ApiProperty porque no viene del body.
  @IsOptional()
  @IsNumber({}, { message: 'El ID debe ser un número' }) // <-- Corregido a IsNumber
  id?: number;
}
