import { IsArray, IsEnum, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DetalleVentaDto } from '../detalle-ventas/dto/detalle-venta.dto';

export class CreateVentaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleVentaDto)
  detalles: DetalleVentaDto[];

  @IsEnum(['efectivo', 'credito', 'debito'])
  medioDePago: 'efectivo' | 'credito' | 'debito';

  //Para cuando se aplique lo de autenticación, se elimina esto del dto.
  @IsInt()
  usuarioId: number;
}
