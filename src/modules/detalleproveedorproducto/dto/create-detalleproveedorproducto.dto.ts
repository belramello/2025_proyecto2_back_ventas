import { IsInt, IsString, Min } from 'class-validator';
import { Producto } from 'src/modules/productos/entities/producto.entity';
import { Proveedore } from 'src/modules/proveedores/entities/proveedore.entity';

export class CreateDetalleProveedorProductoDto {
  @IsString()
  codigo: string;

  proveedor: Proveedore;

  producto: Producto;
}
