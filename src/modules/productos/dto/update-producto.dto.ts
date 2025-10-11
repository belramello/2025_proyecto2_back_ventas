import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoDto } from './create-producto.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductoDto extends PartialType(CreateProductoDto) {
  @ApiPropertyOptional({ example: 'https://example.com/nueva-foto.jpg', description: 'URL actualizada de la imagen' })
  fotoUrl?: string;
}
