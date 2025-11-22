import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { Producto } from '../../../modules/productos/entities/producto.entity';
import { Proveedor } from '../../../modules/proveedores/entities/proveedore.entity';

@Entity('detalle_proveedor_producto')
export class DetalleProveedorProducto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  codigo: string;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.detalles, {
    eager: true,
  })
  proveedor: Proveedor;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => Producto, (producto) => producto.detallesProveedor, {
    onDelete: 'CASCADE',
  })
  producto: Producto;
}
