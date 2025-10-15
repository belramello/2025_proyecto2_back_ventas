import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { Producto } from './entities/producto.entity';
import { DeleteProductoDto } from './dto/delete-producto.dto';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermisosGuard } from 'src/common/guards/permisos.guard';
import { PermisosEnum } from '../permisos/enum/permisos-enum';
import { PermisoRequerido } from 'src/common/decorators/permiso-requerido.decorator';

@UseGuards(AuthGuard, PermisosGuard)
@ApiTags('Productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // ────────────────────────────────
  // 📦 CREAR PRODUCTO
  // ────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({
    status: 201,
    description: 'Producto creado correctamente',
    type: Producto,
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @ApiBody({ type: CreateProductoDto })
  @PermisoRequerido(PermisosEnum.CREAR_PRODUCTO)
  async create(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.create(createProductoDto);
  }

  // ────────────────────────────────
  // 🔍 OBTENER TODOS LOS PRODUCTOS
  // ────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Obtener todos los productos (de todos los usuarios)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos',
    type: [Producto],
  })
  async findAll() {
    return this.productosService.findAll();
  }

  @Get('codigo/:codigo')
  @ApiOperation({ summary: 'Obtener un producto por codigo' })
  @ApiParam({
    name: 'codigo',
    description: 'Codigo del producto',
    example: '43234',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado',
    type: Producto,
  })
  async findByCodigo(codigo: string) {
    return this.productosService.findByCodigo(codigo);
  }

  // ────────────────────────────────
  // 🔎 OBTENER PRODUCTO POR ID
  // ────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado',
    type: Producto,
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @PermisoRequerido(PermisosEnum.VER_PRODUCTOS)
  async findOne(@Param('id') id: string) {
    return this.productosService.findOne(+id);
  }

  // ────────────────────────────────
  // 🛠️ ACTUALIZAR PRODUCTO
  // ────────────────────────────────
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un producto existente' })
  @ApiParam({ name: 'id', description: 'ID del producto', example: 1 })
  @ApiBody({ type: UpdateProductoDto })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @PermisoRequerido(PermisosEnum.MODIFICAR_PRODUCTOS)
  async update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.productosService.update(+id, updateProductoDto);
  }

  // ────────────────────────────────
  // 🗑️ ELIMINAR PRODUCTO (SOFT DELETE)
  // ────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar (soft delete) un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto', example: 1 })
  @ApiResponse({ status: 204, description: 'Producto eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @PermisoRequerido(PermisosEnum.ELIMINAR_PRODUCTOS)
  async remove(@Param('id') id: string) {
    const deleteProductoDto: DeleteProductoDto = { id: Number(id) };
    return this.productosService.remove(deleteProductoDto);
  }
}
