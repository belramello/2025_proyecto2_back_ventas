import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Put,
  UseGuards,
  Req,
  Query,
  Delete,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RespuestaUsuarioDto } from './dto/respuesta-usuario.dto';
import { PermisoRequerido } from '../../common/decorators/permiso-requerido.decorator';
import { PermisosEnum } from '../permisos/enum/permisos-enum';
import { AuthGuard } from '../../middlewares/auth.middleware';
import type { RequestWithUsuario } from '../../middlewares/auth.middleware';
import { PermisosGuard } from '../../common/guards/permisos.guard';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RespuestaFindAllPaginatedUsuariosDTO } from './dto/respuesta-find-all-usuarios-paginated.dto';
import { PaginationDto } from '../ventas/dto/pagination.dto';

@UseGuards(AuthGuard, PermisosGuard)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener usuarios paginadas' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de usuarios',
    type: RespuestaFindAllPaginatedUsuariosDTO,
  })
  @PermisoRequerido(PermisosEnum.VER_USUARIOS)
  findAllPaginated(
    @Query() paginationDto: PaginationDto,
  ): Promise<RespuestaFindAllPaginatedUsuariosDTO> {
    return this.usuarioService.findAllPaginated(paginationDto);
  }

  @PermisoRequerido(PermisosEnum.VER_USUARIOS)
  @Get(':id')
  findUsuario(
    @Param('id') id: number,
    @Req() req: RequestWithUsuario,
  ): Promise<RespuestaUsuarioDto> {
    return this.usuarioService.findUsuario(req.usuario.id);
  }

  @PermisoRequerido(PermisosEnum.ELIMINAR_USUARIOS)
  @Delete(':id')
  delete(@Param('id') id: number): Promise<void> {
    return this.usuarioService.delete(id);
  }

  @PermisoRequerido(PermisosEnum.ASIGNAR_ROL)
  @Put(':usuarioId/asignar-rol/:rolId')
  async asignarRolAUsuario(
    @Param('usuarioId') usuarioId: number,
    @Param('rolId') rolId: number,
  ): Promise<void> {
    return this.usuarioService.actualizarRolDeUsuario(usuarioId, rolId);
  }

  @PermisoRequerido(PermisosEnum.MODIFICAR_USUARIOS)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<RespuestaUsuarioDto> {
    return this.usuarioService.update(id, updateUsuarioDto);
  }
}
