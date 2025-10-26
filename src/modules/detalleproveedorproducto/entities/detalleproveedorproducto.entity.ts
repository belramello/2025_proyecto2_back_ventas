import {
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Entity,
  ManyToOne,
} from 'typeorm';
import { Producto } from 'src/modules/productos/entities/producto.entity';
import { Proveedor } from 'src/modules/proveedores/entities/proveedore.entity';

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

  @ManyToOne(() => Producto, (producto) => producto.detallesProveedor, {
    onDelete: 'CASCADE',
  })
  producto: Producto;
}
