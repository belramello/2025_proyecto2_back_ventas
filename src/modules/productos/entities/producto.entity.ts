import { Usuario } from '../../../modules/usuario/entities/usuario.entity';
import { DetalleVenta } from '../../../modules/ventas/detalle-ventas/entities/detalle-venta.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Linea } from '../../../modules/lineas/entities/linea.entity';
import { Marca } from '../../../modules/marcas/entities/marca.entity';
import { DetalleProveedorProducto } from '../../../modules/detalleproveedorproducto/entities/detalleproveedorproducto.entity';
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

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_creacion_id' })
  usuarioCreacion: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_modificacion_id' })
  usuarioModificacion: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_eliminacion_id' })
  usuarioEliminacion: Usuario;

  @OneToMany(
    () => DetalleProveedorProducto,
    (detalleProveedorProducto) => detalleProveedorProducto.producto,
  )
  detallesProveedor: DetalleProveedorProducto[];
}
