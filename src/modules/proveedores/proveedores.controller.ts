import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedoreDto } from './dto/create-proveedore.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { RespuestaFindOneProveedorDto } from './dto/respuesta-find-one-proveedor.dto';
import { PaginationProveedoresDto } from './dto/pagination.dto';
import { DeleteProveedoreDto } from './dto/delete-proveedore.dto';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
import { PermisoRequerido } from 'src/common/decorators/permiso-requerido.decorator';
import { PermisosEnum } from '../permisos/enum/permisos-enum';

@UseGuards(AuthGuard, PermisosGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo proveedor' })
  @ApiResponse({
    status: 201,
    description: 'Proveedor creado correctamente',
  })
  @PermisoRequerido(PermisosEnum.CREAR_PROVEEDOR)
  @ApiBody({ type: CreateProveedoreDto })
  async create(@Body() createProveedoreDto: CreateProveedoreDto) {
    return this.proveedoresService.create(createProveedoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los proveedores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de proveedores',
    type: [RespuestaFindOneProveedorDto],
  })
  @PermisoRequerido(PermisosEnum.VER_PROVEEDOR)
  async findAll(@Query() paginationDto: PaginationProveedoresDto) {
    return this.proveedoresService.findAllPaginated(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  @ApiParam({ name: 'id', description: 'ID del proveedor', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Proveedor encontrado',
    type: RespuestaFindOneProveedorDto,
  })
  @PermisoRequerido(PermisosEnum.VER_PROVEEDOR)
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.proveedoresService.findOne(+id);
  }

  @Get('nombre/:nombre')
  @ApiOperation({ summary: 'Obtener un proveedor por el nombre de la empresa' })
  @ApiParam({
    name: 'nombre',
    description: 'Nombre del proveedor',
    example: 'Librería Máximo',
  })
  @ApiResponse({
    status: 200,
    description: 'Proveedor encontrado por el nombre ',
    type: RespuestaFindOneProveedorDto,
  })
  @PermisoRequerido(PermisosEnum.VER_PROVEEDOR)
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  async findByNombre(@Param('nombre') nombre: string) {
    return this.proveedoresService.findByNombre(nombre);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar (soft delete) un proveedor' })
  @ApiParam({ name: 'id', description: 'ID del proveedor', example: 1 })
  @ApiResponse({
    status: 204,
    description: 'Proveedor eliminado correctamente',
  })
  @PermisoRequerido(PermisosEnum.ELIMINAR_PROVEEDOR)
  @ApiResponse({
    status: 204,
    description: 'Proveedor eliminado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  async remove(@Param('id') id: string) {
    const deleteProveedorDto: DeleteProveedoreDto = { id: Number(id) };
    return this.proveedoresService.remove(deleteProveedorDto);
  }
}
