import { Controller, Get, Post, Body, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { LineasService } from './lineas.service';
import { CreateLineaDto } from './dto/create-linea.dto';
import { AddMarcaToLineaDto } from './dto/add-marca-to-linea.dto';
import { RespuestaLineaDto } from './dto/respuesta-linea.dto';

import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationLineaDto } from './dto/pagination.dto';
import { RespuestaFindAllLineasAsociadasAMarcaDTO } from './dto/respuesta-linea-marca.dto';

@Controller('lineas')
export class LineasController {
  constructor(private readonly lineaService: LineasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva línea' })
  @ApiResponse({
    status: 201,
    description: 'Línea creada exitosamente',
    type: RespuestaLineaDto,
  })
  async create(@Body() dto: CreateLineaDto): Promise<RespuestaLineaDto> {
    return await this.lineaService.createLinea(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener línea con marcas asociadas' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la línea',
    type: RespuestaLineaDto,
  })
  async find(@Param('id') id: number): Promise<RespuestaLineaDto> {
    return await this.lineaService.findLinea(id);
  }

  @Post('agregar-marca')
  @ApiOperation({ summary: 'Asociar una marca a una línea' })
  @ApiResponse({
    status: 200,
    description: 'Marca asociada exitosamente',
    type: RespuestaLineaDto,
  })
  async añadirMarca(
    @Body() dto: AddMarcaToLineaDto,
  ): Promise<RespuestaLineaDto> {
    return await this.lineaService.agregarMarcaALinea(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una línea' })
  @ApiResponse({
    status: 204,
    description: 'Línea eliminada exitosamente',
  })
  async delete(@Param('id') id: number): Promise<void> {
    return await this.lineaService.delete(id);
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