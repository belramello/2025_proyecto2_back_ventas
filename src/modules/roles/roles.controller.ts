import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { UpdatePermisosRolDto } from './dto/update-permisos-rol.dto';
import { RespuestaFindOneRolesDto } from './dto/respuesta-find-one-roles.dto';
import { AuthGuard } from '../../middlewares/auth.middleware';
import { PermisosGuard } from '../../common/guards/permisos.guard';
import { PermisosEnum } from '../permisos/enum/permisos-enum';
import { PermisoRequerido } from '../../common/decorators/permiso-requerido.decorator';

@UseGuards(AuthGuard, PermisosGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  /*
  @Post()
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolesService.create(createRolDto);
  }
    */

  @PermisoRequerido(PermisosEnum.ACTUALIZAR_PERMISOS_POR_ROL)
  @Get()
  findAll(): Promise<RespuestaFindOneRolesDto[]> {
    return this.rolesService.findAll();
  }

  @PermisoRequerido(PermisosEnum.ACTUALIZAR_PERMISOS_POR_ROL)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @PermisoRequerido(PermisosEnum.ACTUALIZAR_PERMISOS_POR_ROL)
  @Patch(':id/permisos')
  updatePermisos(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdatePermisosRolDto,
  ) {
    return this.rolesService.updatePermisos(id, updateRoleDto);
  }
}
