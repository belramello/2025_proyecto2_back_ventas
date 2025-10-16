import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from 'src/modules/jwt/jwt.service';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { UsuarioService } from 'src/modules/usuario/usuario.service';

export interface RequestWithUsuario extends Request {
  usuario: Usuario;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usuarioService: UsuarioService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: RequestWithUsuario = context.switchToHttp().getRequest();
      const token = request.headers.authorization;
      if (!token) {
        throw new UnauthorizedException('El token no existe');
      }
      const payload = this.jwtService.getPayload(token);
      if (!payload) {
        throw new UnauthorizedException('Token inválido');
      }
      if (!payload.sub) {
        throw new UnauthorizedException(
          'El payload del token no contiene el ID del usuario',
        );
      }
      const usuario = await this.usuarioService.findOne(Number(payload.sub));
      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      request.usuario = usuario;
      return true;
    } catch (error) {
      throw new UnauthorizedException('No autorizado');
    }
  }
}
