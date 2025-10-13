import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { RespuestaCreateVentaDto } from './dto/respuesta-create-venta.dto';
import { RespuestaFindOneVentaDto } from './dto/respuesta-find-one-venta.dto';
import { PaginationDto } from './dto/pagination.dto';
import { RespuestaFindAllPaginatedVentaDTO } from './dto/respuesta-find-all-paginated-venta.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('ventas')
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una venta con sus detalles' })
  @ApiBody({ type: CreateVentaDto })
  @ApiResponse({
    status: 201,
    description: 'Venta creada correctamente',
    type: RespuestaCreateVentaDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(
    @Body() createVentaDto: CreateVentaDto,
  ): Promise<RespuestaCreateVentaDto> {
    return this.ventasService.create(createVentaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener ventas paginadas' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de ventas',
    type: RespuestaFindAllPaginatedVentaDTO,
  })
  findAllPaginated(
    @Query() paginationDto: PaginationDto,
  ): Promise<RespuestaFindAllPaginatedVentaDTO> {
    return this.ventasService.findAllPaginated(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una venta por ID' })
  @ApiParam({ name: 'id', description: 'ID de la venta', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Venta encontrada',
    type: RespuestaFindOneVentaDto,
  })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RespuestaFindOneVentaDto> {
    return this.ventasService.findOne(id);
  }
}
