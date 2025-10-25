import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Linea } from 'src/modules/lineas/entities/linea.entity';
import { Producto } from 'src/modules/productos/entities/producto.entity';
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



  @ManyToMany(() => Linea, (linea) => linea.marcas)
  lineas: Linea[];

  @OneToMany(() => Producto, (producto) => producto.marca)
  productos: Producto[];

  @DeleteDateColumn({ nullable: true }) 
  fechaEliminacion: Date;
}
