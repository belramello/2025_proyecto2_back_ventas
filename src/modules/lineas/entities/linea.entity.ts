import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Marca } from 'src/modules/marcas/entities/marca.entity';
import { Producto } from 'src/modules/productos/entities/producto.entity';
import { IsOptional } from 'class-validator';

@Entity('linea')
export class Linea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column({ nullable: true })
  @IsOptional()
  descripcion?: string;

  @ManyToMany(() => Marca, (marca) => marca.lineas)
  @JoinTable()
  marcas: Marca[];

  @OneToMany(() => Producto, (producto) => producto.linea)
  productos: Producto[];
}
