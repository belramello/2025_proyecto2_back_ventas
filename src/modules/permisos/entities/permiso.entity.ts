import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Rol } from '../../roles/entities/rol.entity';

@Entity('permisos')
export class Permiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @ManyToMany(() => Rol, (rol) => rol.permisos)
  roles: Rol[];
}
