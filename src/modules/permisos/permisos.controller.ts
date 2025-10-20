import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { Permiso } from './entities/permiso.entity';

@UseGuards(AuthGuard)
@Controller('permisos')
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}
  /*
  @Post()
  create(@Body() createPermisoDto: CreatePermisoDto) {
    return this.permisosService.create(createPermisoDto);
  }
    */
  @Get()
  findAll(): Promise<Permiso[]> {
    return this.permisosService.findAll();
  }
}
