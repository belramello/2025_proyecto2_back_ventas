import { DetalleVenta } from '../../../modules/ventas/detalle-ventas/entities/detalle-venta.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column()
  marca: string; //Reemplazar por entidad Marca. Al modificar, modificar DTOs.

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

  @UpdateDateColumn({ nullable: true }) //Puede no tener fecha de actualizacion
  fechaActualizacion: Date;

  @DeleteDateColumn({ nullable: true }) //Puede no tener fecha de eliminacion
  fechaEliminacion: Date;

  @Column()
  descripcion: string;

  @Column()
  usuarioId: number; //Reemplazar por entidad Usuario
}
