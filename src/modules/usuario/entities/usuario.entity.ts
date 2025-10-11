import { ApiProperty } from '@nestjs/swagger';
import { Venta } from 'src/modules/ventas/entities/venta.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  /*
  @ApiProperty({
    example: 'Auditor',
    description: 'Rol del usuario',
  })
  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  Rol: Rol
  */

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
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaHoraCreacion: Date;

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

  @OneToMany(() => Venta, (venta) => venta.usuario)
  ventas: Venta[];
}
