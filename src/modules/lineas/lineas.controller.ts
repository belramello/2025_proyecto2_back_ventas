import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { LineasService } from './lineas.service';
import { CreateLineaDto } from './dto/create-linea.dto';
import { AddMarcaToLineaDto } from './dto/add-marca-to-linea.dto';
import { RespuestaLineaDto } from './dto/respuesta-linea.dto';

import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '../../middlewares/auth.middleware';
import type { RequestWithUsuario } from '../../middlewares/auth.middleware';
import { PermisosGuard } from '../../common/guards/permisos.guard';
import { PermisoRequerido } from '../../common/decorators/permiso-requerido.decorator';
import { PermisosEnum } from '../permisos/enum/permisos-enum';
import { PaginationLineaDto } from './dto/pagination.dto';
import { RespuestaFindAllLineasAsociadasAMarcaDTO } from './dto/respuesta-linea-marca.dto';

@ApiTags('Líneas')
@UseGuards(AuthGuard, PermisosGuard)
@Controller('lineas')
export class LineasController {
  constructor(private readonly lineaService: LineasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva línea' })
  @ApiBody({ type: CreateLineaDto })
  @ApiResponse({
    status: 201,
    description: 'Línea creada exitosamente',
    type: RespuestaLineaDto,
  })
  @PermisoRequerido(PermisosEnum.CREAR_LINEAS) // 👈 Permiso requerido
  async create(
    @Body() dto: CreateLineaDto,
    @Req() req: RequestWithUsuario, // 👈 Se inyecta Request para obtener el usuario
  ): Promise<RespuestaLineaDto> {
    // Se pasa el usuario al servicio para el registro de historial
    return await this.lineaService.createLinea(dto, req.usuario);
  }

  // ────────────────────────────────
  // 🔎 OBTENER LÍNEA POR ID
  // ────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Obtener línea con marcas asociadas' })
  @ApiParam({ name: 'id', description: 'ID de la línea', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la línea',
    type: RespuestaLineaDto,
  })
  @PermisoRequerido(PermisosEnum.VER_LINEAS) // 👈 Permiso requerido
  async find(@Param('id') id: number): Promise<RespuestaLineaDto> {
    return await this.lineaService.findLinea(id);
  }

  @Post('agregar-marca')
  @ApiOperation({ summary: 'Asociar una marca a una línea' })
  @ApiBody({ type: AddMarcaToLineaDto })
  @ApiResponse({
    status: 200,
    description: 'Marca asociada exitosamente',
    type: RespuestaLineaDto,
  })
  @PermisoRequerido(PermisosEnum.MODIFICAR_LINEAS) // 👈 Permiso requerido (Modificar/Vincular)
  async añadirMarca(
    @Body() dto: AddMarcaToLineaDto,
    @Req() req: RequestWithUsuario, // 👈 Se inyecta Request para obtener el usuario
  ): Promise<RespuestaLineaDto> {
    // Se pasa el usuario al servicio para el registro de historial
    return await this.lineaService.agregarMarcaALinea(dto, req.usuario);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 👈 Respuesta 204 sin contenido
  @ApiOperation({ summary: 'Eliminar una línea (Soft Delete)' })
  @ApiParam({ name: 'id', description: 'ID de la línea', example: 1 })
  @ApiResponse({
    status: 204,
    description: 'Línea eliminada exitosamente',
  })
  @PermisoRequerido(PermisosEnum.ELIMINAR_LINEAS) // 👈 Permiso requerido
  async delete(
    @Param('id') id: number,
    @Req() req: RequestWithUsuario, // 👈 Se inyecta Request para obtener el usuario
  ): Promise<void> {
    // Se pasa el usuario al servicio para el registro de historial
    return await this.lineaService.delete(id, req.usuario);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las lineas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de lineas',
    type: [RespuestaLineaDto],
  })
  async findAll(@Query() paginationDto: PaginationLineaDto) {
    return this.lineaService.findAllPaginated(paginationDto);
  }
  @Get('por-marca/:marcaId')
  @ApiOperation({ summary: 'Obtener líneas asociadas a una marca' })
  @ApiResponse({
    status: 200,
    description: 'Líneas asociadas a la marca seleccionada',
    type: RespuestaFindAllLineasAsociadasAMarcaDTO,
  })
  async obtenerLineasAsociadasAMarca(
    @Param('marcaId', ParseIntPipe) marcaId: number,
  ): Promise<RespuestaFindAllLineasAsociadasAMarcaDTO> {
    return this.lineaService.obtenerLineasAsociadasAMarca(marcaId);
  }
}
