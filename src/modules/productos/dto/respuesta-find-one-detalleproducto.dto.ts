import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { RespuestaFindOneDetalleProveedorProductoDto } from '../../../modules/detalleproveedorproducto/dto/respuesta-find-one-detalleproveedorproducto.dto';

export class RespuestaFindOneDetalleProductoDto {
  @ApiProperty({ example: 3, description: 'ID del producto' })
  @IsInt()
  @Min(1)
  id: number;

  detalles: RespuestaFindOneDetalleProveedorProductoDto[];
}
