import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { Payload } from './interfaces/payload.interface';

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  private readonly authConfig = {
    secret: process.env.JWT_AUTH_SECRET || 'authSecret', // Secreto para los tokens de autenticación
    expiresIn: process.env.JWT_AUTH_EXPIRES_IN || '1d', // Duración por defecto
  };

  private readonly refreshConfig = {
    secret: process.env.JWT_REFRESH_SECRET || 'refreshSecret', // Secreto para los tokens de refresh
    expiresIn: process.env.JWT_REFRESH_ESPIRES_IN || '1d', // Duración por defecto
  };

  // Genera un token (auth o refresh) con el payload proporcionado
  generateToken(
    payload: {
      email: string;
      sub: string;
    },
    type: 'auth' | 'refresh' = 'auth',
  ): string {
    const config = type === 'auth' ? this.authConfig : this.refreshConfig;
    return this.jwtService.sign(payload, {
      secret: config.secret,
      expiresIn: config.expiresIn,
    });
  }

  // Refresca el token de autenticación usando el token de refresh
  refrestToken(refreshToken: string): {
    accesToken: string;
    refreshToken?: string;
  } {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: this.refreshConfig.secret }) as Payload;
      const currentTime = Math.floor(Date.now() / 1000);
      const timeToExpire = (payload.exp - currentTime) / 60; 

      if (timeToExpire < 30) {
        return {
          accesToken: this.generateToken({ email: payload.email, sub: payload.sub }, 'auth'),
          refreshToken: this.generateToken({ email: payload.email, sub: payload.sub }, 'refresh'),
        };
      }

      return {
        accesToken: this.generateToken({ email: payload.email, sub: payload.sub }, 'auth'),
      };
    } catch (error) {
      throw new UnauthorizedException('Token de Refresh inválido o expirado');
    }
  }

  // Obtiene y valida el payload de un token
  getPayload(token: string, type: 'auth' | 'refresh' = 'auth'): Payload {
    const config = type === 'auth' ? this.authConfig : this.refreshConfig;
    try {
      return this.jwtService.verify(token, { secret: config.secret }) as Payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
