import { Controller, Get, Body, Patch, Param, Put } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RespuestaUsuarioDto } from './dto/respuesta-usuario.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  findAll(): Promise<RespuestaUsuarioDto[]> {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  findMe(@Param('id') id: number): Promise<RespuestaUsuarioDto> {
    return this.usuarioService.findMe(id);
  }

  @Put(':usuarioId/asignar-rol/:rolId')
  async asignarRolAUsuario(
    @Param('id') usuarioId: number,
    @Param('id') rolId: number,
  ) {
    return this.usuarioService.actualizarRolDeUsuario(usuarioId, rolId);
  }

  //Implementar actualización de información personal.
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(+id, updateUsuarioDto);
  }
}
