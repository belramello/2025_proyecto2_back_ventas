import { Column, Entity, PrimaryGeneratedColumn, DeleteDateColumn } from 'typeorm';

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
  // agregarr la relación con lineas cuando lo termine la belu:
  // import { OneToMany } from 'typeorm';
  // import { Linea } from '../../lineas/entities/linea.entity';
  // @OneToMany(() => Linea, (linea) => linea.marca)
  // lineas: Linea[];
}