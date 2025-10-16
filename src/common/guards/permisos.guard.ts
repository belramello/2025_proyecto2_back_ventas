import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PERMISO_REQUERIDO_KEY } from '../decorators/permiso-requerido.decorator';
import { PermisosEnum } from 'src/modules/permisos/enum/permisos-enum';
import { Reflector } from '@nestjs/core';
import { RequestWithUsuario } from 'src/middlewares/auth.middleware';

@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtiene el permiso requerido del decorador
    const permisoRequerido = this.reflector.getAllAndOverride<PermisosEnum>(
      PERMISO_REQUERIDO_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permisoRequerido) return true; // si el endpoint no requiere permiso, se permite el acceso

    // Obteniene el usuario autenticado (inyectado por el AuthGuard)
    const request = context.switchToHttp().getRequest<RequestWithUsuario>();
    const usuario = request.usuario;

    if (!usuario || !usuario.rol) {
      throw new ForbiddenException('Usuario o rol no encontrado.');
    }

    // Obteniene los permisos del rol
    const permisosDelRol = usuario.rol.permisos.map((permiso) => permiso.id);

    // Valida si el rol tiene el permiso requerido
    const tienePermiso = permisosDelRol.includes(permisoRequerido);

    if (!tienePermiso) {
      throw new ForbiddenException(
        `No tenés permiso para acceder a esta funcionalidad.`,
      );
    }

    return true;
  }
}
