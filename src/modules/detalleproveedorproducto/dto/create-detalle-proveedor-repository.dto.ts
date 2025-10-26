import { Producto } from '../../../modules/productos/entities/producto.entity';
import { Proveedor } from '../../../modules/proveedores/entities/proveedore.entity';

export class CreateDetalleProveedorRepositoryDto {
  codigo: string;

  proveedor: Proveedor;

  producto: Producto;
}
