import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtService {
  config = {
    auth: {
      secret: 'authSecret', // Clave secreta para los tokens de autenticacion
      expiresIn: '1d', // Tiempo de expiración para los tokens de autenticación
    },
    refresh: {
      secret: 'refreshSecret', // Clave secreta para los tokens de refresh
      expiresIn: '1d', // Tiempo de expiración para los tokens de refresh
    },
  };
}
