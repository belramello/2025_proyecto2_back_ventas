import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Venta } from '../../entities/venta.entity';
import { Producto } from 'src/modules/productos/entities/producto.entity';

@Entity('detalle_ventas')
export class DetalleVenta {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Venta, (venta) => venta.detalleVentas)
  venta: Venta;

  @ManyToOne(() => Producto, (producto) => producto.detalleVentas)
  producto: Producto;

  @Column()
  cantidad: number;

  @Column()
  precioUnitario: number;
}
