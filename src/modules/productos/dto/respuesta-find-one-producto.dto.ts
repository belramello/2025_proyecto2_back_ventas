import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { RespuestaFindOneDetalleProveedorProductoDto } from 'src/modules/detalleproveedorproducto/dto/respuesta-find-one-detalleproveedorproducto.dto';
import { RespuestaLineaDto } from 'src/modules/lineas/dto/respuesta-linea.dto';
import { RespuestaMarcaDto } from 'src/modules/marcas/dto/respuesta-marca.dto';

export class RespuestaFindOneProductoDto {
  @ApiProperty({ example: 3, description: 'ID del producto a buscar' })
  @IsInt()
  @Min(1)
  id: number;
  nombre: string;

  codigo: string;

  precio: number;

  marca:RespuestaMarcaDto
  linea:RespuestaLineaDto

  stock: number;


  fotoUrl: string;

  fechaCreacion: Date;

  descripcion: string;
  detalles: RespuestaFindOneDetalleProveedorProductoDto[];
}
