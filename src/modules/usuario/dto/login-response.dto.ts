import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../entities/usuario.entity';

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: () => Usuario })
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
}
