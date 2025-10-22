import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
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
import { Marca } from 'src/modules/marcas/entities/marca.entity';

//Tabla Productos
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

  @ManyToOne(() => Marca, (marca) => marca.productos)
  @JoinColumn({ name: 'marca_id' }) // Este será el campo (columna) en la tabla 'productos'
  marca: Marca;

  @Column()
  stock: number;

  @Column()
  linea: string; //Reemplazar por entidad Linea

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
}
