import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdatePermisosRolDto } from './dto/update-permisos-rol.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolesService.create(createRolDto);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Patch(':id/permisos')
  updatePermisos(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdatePermisosRolDto,
  ) {
    return this.rolesService.updatePermisos(id, updateRoleDto);
  }
}
