import { Producto } from '../../productos/entities/producto.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

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

  // Relación: Una marca tiene muchos productos
  @OneToMany(() => Producto, (producto) => producto.marca)
  productos: Producto[];
}
