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
  Query,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { AuthGuard } from '../../middlewares/auth.middleware';
import type { RequestWithUsuario } from '../../middlewares/auth.middleware';
import { PermisosGuard } from '../../common/guards/permisos.guard';
import { PermisoRequerido } from '../../common/decorators/permiso-requerido.decorator';
import { PermisosEnum } from '../permisos/enum/permisos-enum';
import { PaginationDto } from '../ventas/dto/pagination.dto';

// --- AÑADIDO: Lógica de almacenamiento local ---
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Ruta donde se guardarán las imágenes
const storagePath = './uploads/productos';

// Opciones de Multer para guardar en disco
export const multerOptions = {
  storage: diskStorage({
    // 1. Dónde guardar
    destination: (req, file, cb) => {
      // Asegurarse de que el directorio exista
      if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
      }
      cb(null, storagePath);
    },
    // 2. Con qué nombre guardar
    filename: (req, file, cb) => {
      // Limpiar nombre y añadir sufijo único
      const name = file.originalname.split('.')[0].replace(/\s/g, '_');
      const extension = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${name}-${uniqueSuffix}${extension}`);
    },
  }),
};
// --- FIN DE LÓGICA AÑADIDA ---

@UseGuards(AuthGuard, PermisosGuard)
@ApiTags('Productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  // --- CAMBIO: Usar multerOptions para guardar en disco ---
  @UseInterceptors(FileInterceptor('imagen', multerOptions))
  @ApiResponse({
    status: 201,
    description: 'Producto creado correctamente',
    type: Producto,
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @ApiBody({ type: CreateProductoDto })
  @PermisoRequerido(PermisosEnum.CREAR_PRODUCTO)
  async create(
    @Body() createProductoDto: CreateProductoDto,
    @Req() req: RequestWithUsuario,
    @UploadedFile() file: Express.Multer.File, // Recibe el archivo
  ) {
    return this.productosService.create(createProductoDto, req.usuario, file);
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
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.productosService.findAllPaginated(paginationDto);
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
  async findOne(@Param('id') id: number) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un producto existente' })
  // --- CAMBIO: Usar multerOptions también al actualizar ---
  @UseInterceptors(FileInterceptor('imagen', multerOptions))
  @ApiParam({ name: 'id', description: 'ID del producto', example: 1 })
  @ApiBody({ type: UpdateProductoDto })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @PermisoRequerido(PermisosEnum.MODIFICAR_PRODUCTOS)
  async update(
    @Param('id') id: number,
    @Body() updateProductoDto: UpdateProductoDto,
    @Req() req: RequestWithUsuario,
    @UploadedFile() file?: Express.Multer.File, // Recibe archivo opcional
  ) {
    return this.productosService.update(
      id,
      updateProductoDto,
      req.usuario,
      file,
    );
  }

  @Get('codigo/:codigo')
  @ApiOperation({ summary: 'Obtener un producto por código' })
  @ApiParam({ name: 'codigo', description: 'Código del producto', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado',
    type: Producto,
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @PermisoRequerido(PermisosEnum.CREAR_VENTA)
  async findOneByCodigo(@Param('codigo') codigo: string) {
    return this.productosService.findOneByCodigo(codigo);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar (soft delete) un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto', example: 1 })
  @ApiResponse({ status: 204, description: 'Producto eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @PermisoRequerido(PermisosEnum.ELIMINAR_PRODUCTOS)
  async remove(@Param('id') id: string, @Req() req: RequestWithUsuario) {
    const usuarioAutenticadoId = req.usuario.id;
    const deleteProductoDto: DeleteProductoDto = {
      id: Number(id),
      usuarioId: usuarioAutenticadoId,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.productosService.remove(deleteProductoDto);
  }
}
