import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RespuestaUsuarioDto } from './dto/respuesta-usuario.dto';
import { PermisoRequerido } from 'src/common/decorators/permiso-requerido.decorator';
import { PermisosEnum } from '../permisos/enum/permisos-enum';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import type { RequestWithUsuario } from 'src/middlewares/auth.middleware';
import { PermisosGuard } from 'src/common/guards/permisos.guard';

@UseGuards(AuthGuard, PermisosGuard)
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @PermisoRequerido(PermisosEnum.ASIGNAR_ROL)
  @Get()
  findAll(): Promise<RespuestaUsuarioDto[]> {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  findMe(
    @Param('id') id: number,
    @Req() req: RequestWithUsuario,
  ): Promise<RespuestaUsuarioDto> {
    return this.usuarioService.findMe(req.usuario.id);
  }

  @PermisoRequerido(PermisosEnum.ASIGNAR_ROL)
  @Put(':usuarioId/asignar-rol/:rolId')
  async asignarRolAUsuario(
    @Param('usuarioId') usuarioId: number,
    @Param('rolId') rolId: number,
  ) {
    return this.usuarioService.actualizarRolDeUsuario(usuarioId, rolId);
  }

  //Implementar actualización de información personal.
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(+id, updateUsuarioDto);
  }
}
