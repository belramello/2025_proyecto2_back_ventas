import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '../../../modules/roles/entities/rol.entity';
import { Venta } from '../../../modules/ventas/entities/venta.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Producto } from 'src/modules/productos/entities/producto.entity';

@Entity('usuarios')
export class Usuario {
  @ApiProperty({
    example: 1,
    description: 'Identificador único del usuario',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Alejo',
    description: 'Nombre del usuario',
  })
  @Column()
  nombre: string;

  @ApiProperty({
    example: 'De Miguel',
    description: 'Apellido del usuario',
  })
  @Column()
  apellido: string;

  @ApiProperty({
    example: 'Auditor',
    description: 'Rol del usuario',
  })
  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  rol: Rol;

  @ApiProperty({
    example: 'alejo@gmail.com',
    description: 'Email único del usuario',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario',
  })
  @Column()
  password: string;

  @ApiProperty({
    example: '2023-10-01T12:00:00Z',
    description: 'Fecha y hora de creación del usuario',
  })
  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;

  /*
  @ApiProperty({
    type: () => [HistorialSesion],
    description: 'Historial de sesiones del usuario',
  })
  @OneToMany(() => HistorialSesion, (historial) => historial.usuario)
  historialSesion: HistorialSesion[];
  */

  /*
  @ApiProperty({
    type: () => [TokenReinicioContraseña],
    description: 'Tokens de reinicio de contraseña asociados al usuario',
  })
  @OneToMany(() => TokenReinicioContraseña, (token) => token.usuario)
  tokenReinicioContraseña: TokenReinicioContraseña[]
  */

  @OneToMany(() => Producto, (producto) => producto.usuarioCreacion)
  productos: Producto[];

  @OneToMany(() => Venta, (venta) => venta.vendedor)
  ventas: Venta[];

  @DeleteDateColumn()
  fechaEliminacion: Date;

  @ApiProperty({
    example: null,
    description: 'Token para reset de contraseña (nullable)',
    required: false,
  })
  @Column({
    name: 'passwordresettoken',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordResetToken: string | null;

  @ApiProperty({
    example: null,
    description: 'Fecha de expiración del token de reset (nullable)',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpiration: Date | null;
}
