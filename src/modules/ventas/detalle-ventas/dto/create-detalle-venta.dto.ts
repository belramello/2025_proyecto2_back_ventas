import { IsInt } from 'class-validator';
import { Producto } from '../../../../modules/productos/entities/producto.entity';
import { Venta } from '../../entities/venta.entity';

export class CreateDetalleVentaDto {
  producto: Producto;

  @IsInt()
  cantidad: number;

  precioUnitario: number;

  venta: Venta;
}
