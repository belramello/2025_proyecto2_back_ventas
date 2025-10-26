import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { MetabaseService } from './metabase.service';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import type { RequestWithUsuario } from 'src/middlewares/auth.middleware';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
@Controller('metabase')
export class MetabaseController {
  constructor(private readonly metabaseService: MetabaseService) {}

  @UseGuards(AuthGuard, PermisosGuard)
  @Get()
  getSignedUrl(@Req() req: RequestWithUsuario): { signedUrl: string } {
    return this.metabaseService.generateSignedUrl(req.usuario.id);
  }
}
