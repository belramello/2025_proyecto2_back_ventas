import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Accion } from './accion.entity';
import { Estado } from './estado.entity';

@Entity('historialActividades')
export class HistorialActividades {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuario: number;

  @ManyToOne(() => Accion)
  @JoinColumn({ name: 'accion_id' })
  accion: Accion;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaHora: Date;

  @ManyToOne(() => Estado)
  @JoinColumn({ name: 'estado_id' })
  estado: Estado;
}
