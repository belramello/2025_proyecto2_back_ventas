import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('accion')
export class Accion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;
}
