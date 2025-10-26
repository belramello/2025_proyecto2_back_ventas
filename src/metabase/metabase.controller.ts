import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { MetabaseService } from './metabase.service';
import { AuthGuard } from '../middlewares/auth.middleware';
import type { RequestWithUsuario } from '../middlewares/auth.middleware';
import { PermisosGuard } from '../common/guards/permisos.guard';
@Controller('metabase')
export class MetabaseController {
  constructor(private readonly metabaseService: MetabaseService) {}

  @UseGuards(AuthGuard, PermisosGuard)
  @Get()
  getSignedUrl(@Req() req: RequestWithUsuario): { signedUrl: string } {
    return this.metabaseService.generateSignedUrl(
      req.usuario.id,
      req.usuario.rol.id,
    );
  }
}
