import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
