import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'time' })
  hora: string;

  @Column()
  total: number;

  @Column()
  medioDePago: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.ventas)
  usuario: Usuario;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;

  @DeleteDateColumn()
  fechaEliminacion: Date;
}
