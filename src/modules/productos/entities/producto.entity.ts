import { DetalleVenta } from '../../../modules/ventas/detalle-ventas/entities/detalle-venta.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DetalleProveedorProducto } from 'src/modules/detalleproveedorproducto/entities/detalleproveedorproducto.entity';
import { Linea } from 'src/modules/lineas/entities/linea.entity';
import { Marca } from 'src/modules/marcas/entities/marca.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'varchar', unique: true })
  codigo: string;

  @Column()
  precio: number;

  @Column()
  stock: number;

  @ManyToOne(() => Linea, (linea) => linea.productos)
  linea: Linea;
  @ManyToOne(() => Marca, (marca) => marca.productos)
  marca: Marca;

  @Column()
  fotoUrl: string;

  @OneToMany(() => DetalleVenta, (detalleVenta) => detalleVenta.producto)
  detalleVentas: DetalleVenta[];

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn({ nullable: true })
  fechaActualizacion: Date;

  @DeleteDateColumn({ nullable: true })
  fechaEliminacion: Date;

  @Column()
  descripcion: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.productos)
  usuario: Usuario;

  @OneToMany(() => DetalleProveedorProducto, (detalle) => detalle.producto, {
    cascade: true,
  })
  detallesProveedor: DetalleProveedorProducto[];
}
