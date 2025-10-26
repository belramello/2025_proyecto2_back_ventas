import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DetalleProveedorProducto } from 'src/modules/detalleproveedorproducto/entities/detalleproveedorproducto.entity';
@Entity('proveedores')
export class Proveedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  direccion: string;

  @Column()
  email: string;

  @Column()
  contacto: string;

  @Column()
  provincia: string;

  @Column()
  localidad: string;

  @OneToMany(() => DetalleProveedorProducto, (detalle) => detalle.proveedor)
  detalles: DetalleProveedorProducto[];

  @DeleteDateColumn({ nullable: true }) //Puede no tener fecha de eliminacion
  fechaEliminacion: Date;
}
