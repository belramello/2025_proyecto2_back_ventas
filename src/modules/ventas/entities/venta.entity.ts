import { Usuario } from '../../../modules/usuario/entities/usuario.entity';
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
import { DetalleVenta } from '../detalle-ventas/entities/detalle-venta.entity';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  total: number;

  @Column({ enum: ['efectivo', 'credito', 'debito'] })
  medioDePago: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.ventas)
  vendedor: Usuario;

  @OneToMany(() => DetalleVenta, (detalleVenta) => detalleVenta.venta, {
    cascade: true,
  })
  detalleVentas: DetalleVenta[];

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn({ nullable: true })
  fechaActualizacion: Date;

  @DeleteDateColumn({ nullable: true })
  fechaEliminacion: Date;
}
