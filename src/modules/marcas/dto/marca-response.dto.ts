import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MarcaResponseDto {
  @ApiProperty({ example: 1, description: 'ID único de la marca' })
  id: number;

  @ApiProperty({ example: 'Bic', description: 'Nombre de la marca' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Artículos de librería', description: 'Descripción (puede ser nula)' })
  descripcion: string | null;

  @ApiPropertyOptional({ example: 'http://localhost:3000/uploads/logos/logo-12345.webp', description: 'URL completa del logo (puede ser nula)' })
  logoUrl: string | null;
}