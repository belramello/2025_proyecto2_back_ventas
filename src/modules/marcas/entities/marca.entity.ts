import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Linea } from 'src/modules/lineas/entities/linea.entity';
@Entity('marcas')
export class Marca {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  logo: string;
  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => Linea, (linea) => linea.marca)
  lineas: Linea[];
}
