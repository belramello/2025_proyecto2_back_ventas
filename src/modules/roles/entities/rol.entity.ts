import { Permiso } from '../../../modules/permisos/entities/permiso.entity';
import { Usuario } from '../../../modules/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column()
  descripcion: string;

  @Column()
  modificable: boolean;

  @ManyToMany(() => Permiso, (permiso) => permiso.roles)
  @JoinTable({
    name: 'roles_permisos',
    joinColumn: { name: 'rol_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permiso_id', referencedColumnName: 'id' },
  })
  permisos: Permiso[];

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[];
}
