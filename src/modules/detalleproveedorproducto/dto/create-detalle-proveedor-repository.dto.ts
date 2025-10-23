import { Producto } from 'src/modules/productos/entities/producto.entity';
import { Proveedor } from 'src/modules/proveedores/entities/proveedore.entity';

export class CreateDetalleProveedorRepositoryDto {
  codigo: string;

  proveedor: Proveedor;

  producto: Producto;
}
