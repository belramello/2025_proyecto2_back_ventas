import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdatePermisosRolDto } from './dto/update-permisos-rol.dto';
import { RespuestaFindAllRoles } from './dto/respuesta-find-one-roles.dto';
import { AuthGuard } from 'src/middlewares/auth.middleware';

@UseGuards(AuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolesService.create(createRolDto);
  }
  @Get()
  findAll(): Promise<RespuestaFindAllRoles[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id/permisos')
  updatePermisos(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdatePermisosRolDto,
  ) {
    return this.rolesService.updatePermisos(id, updateRoleDto);
  }
}
