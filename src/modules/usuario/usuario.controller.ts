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
  Post,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RespuestaUsuarioDto } from './dto/respuesta-usuario.dto';
import { PermisoRequerido } from '../../common/decorators/permiso-requerido.decorator';
import { PermisosEnum } from '../permisos/enum/permisos-enum';
import { AuthGuard } from '../../middlewares/auth.middleware';
import type { RequestWithUsuario } from '../../middlewares/auth.middleware';
import { PermisosGuard } from '../../common/guards/permisos.guard';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RespuestaFindAllPaginatedUsuariosDTO } from './dto/respuesta-find-all-usuarios-paginated.dto';
import { PaginationDto } from '../ventas/dto/pagination.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@UseGuards(PermisosGuard)
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
  @UseGuards(AuthGuard)
  @PermisoRequerido(PermisosEnum.VER_USUARIOS)
  findAllPaginated(
    @Query() paginationDto: PaginationDto,
  ): Promise<RespuestaFindAllPaginatedUsuariosDTO> {
    return this.usuarioService.findAllPaginated(paginationDto);
  }

  @UseGuards(AuthGuard)
  @PermisoRequerido(PermisosEnum.VER_USUARIOS)
  @Get(':id')
  findUsuario(
    @Param('id') id: number,
    @Req() req: RequestWithUsuario,
  ): Promise<RespuestaUsuarioDto> {
    return this.usuarioService.findUsuario(req.usuario.id);
  }

  @UseGuards(AuthGuard)
  @PermisoRequerido(PermisosEnum.ELIMINAR_USUARIOS)
  @Delete(':id')
  delete(@Param('id') id: number): Promise<void> {
    return this.usuarioService.delete(id);
  }

  @UseGuards(AuthGuard)
  @PermisoRequerido(PermisosEnum.ASIGNAR_ROL)
  @Put(':usuarioId/asignar-rol/:rolId')
  async asignarRolAUsuario(
    @Param('usuarioId') usuarioId: number,
    @Param('rolId') rolId: number,
  ): Promise<void> {
    return this.usuarioService.actualizarRolDeUsuario(usuarioId, rolId);
  }

  @UseGuards(AuthGuard)
  @PermisoRequerido(PermisosEnum.MODIFICAR_USUARIOS)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<RespuestaUsuarioDto> {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @UseGuards(AuthGuard)
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Solicitar recuperación de contraseña',
  })
  @ApiResponse({
    status: 200,
    description: 'Email de recuperación enviado',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    await this.usuarioService.forgotPassword(dto.email);
  }

  @UseGuards(AuthGuard)
  @Post('reset-password')
  @ApiOperation({
    summary: 'Resetear contraseña con token',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada',
  })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.usuarioService.resetPassword(dto.token, dto.newPassword);
  }
}
