import { SetMetadata } from '@nestjs/common';
import { PermisosEnum } from '../../modules/permisos/enum/permisos-enum';

export const PERMISO_REQUERIDO_KEY = 'permiso_requerido';

export const PermisoRequerido = (permiso: PermisosEnum) =>
  SetMetadata(PERMISO_REQUERIDO_KEY, permiso);
