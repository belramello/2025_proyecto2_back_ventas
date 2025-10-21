import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  Put,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdatePermisosRolDto } from './dto/update-permisos-rol.dto';
import { RespuestaFindOneRolesDto } from './dto/respuesta-find-one-roles.dto';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
import { PermisosEnum } from '../permisos/enum/permisos-enum';
import { PermisoRequerido } from 'src/common/decorators/permiso-requerido.decorator';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

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
  @Get()
  @ApiOperation({ summary: 'Listar todos los roles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles',
    type: RespuestaFindOneRolesDto,
    isArray: true,
  })
  findAll(): Promise<RespuestaFindOneRolesDto[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del rol' })
  @ApiResponse({
    status: 200,
    description: 'Rol encontrado',
    type: RespuestaFindOneRolesDto,
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @PermisoRequerido(PermisosEnum.ACTUALIZAR_PERMISOS_POR_ROL)
  @Patch(':id/permisos')
  @ApiOperation({ summary: 'Actualizar permisos de un rol' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del rol a actualizar',
  })
  @ApiBody({ type: UpdatePermisosRolDto })
  @ApiResponse({ status: 204, description: 'Permisos actualizados' })
  @ApiResponse({ status: 404, description: 'Rol o permisos no encontrados' })
  @Patch(':id/permisos')
  updatePermisos(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdatePermisosRolDto,
  ) {
    return this.rolesService.updatePermisos(id, updateRoleDto);
  }
}
