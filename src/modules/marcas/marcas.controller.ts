import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PermisoRequerido } from '../../common/decorators/permiso-requerido.decorator';
import { PermisosEnum } from '../permisos/enum/permisos-enum';
import { AuthGuard } from '../../middlewares/auth.middleware';
import type { RequestWithUsuario } from '../../middlewares/auth.middleware';
import { PaginationDto } from './dto/pagination.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { RespuestaFindAllPaginatedMarcasDTO } from './dto/respuesta-find-all-paginated-marcas.dto';
import { MarcaResponseDto } from './dto/marca-response.dto';

@ApiTags('Marcas')
@UseGuards(AuthGuard)
@Controller('marcas')
export class MarcasController {
  constructor(private readonly marcasService: MarcasService) {}

  // ────────────────────────────────
  // 🟢 CREAR MARCA
  // ────────────────────────────────
  @Post()
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = extname(file.originalname);
          cb(null, `logo-${uniqueSuffix}${extension}`);
        },
      }),
    }),
  )
  @PermisoRequerido(PermisosEnum.CREAR_MARCAS)
  @ApiOperation({ summary: 'Crear una nueva marca' })
  @ApiBody({ type: CreateMarcaDto })
  @ApiResponse({
    status: 201,
    description: 'Marca creada exitosamente.',
    type: MarcaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o conflicto en nombre.',
  })
  async create(
    @Body() createMarcaDto: CreateMarcaDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUsuario,
  ): Promise<MarcaResponseDto> {
    if (file) {
      createMarcaDto.logo = file.filename;
    }
    return this.marcasService.create(createMarcaDto, req.usuario);
  }

  // ────────────────────────────────
  // 📜 LISTAR MARCAS
  // ────────────────────────────────
  @Get()
  @PermisoRequerido(PermisosEnum.VER_MARCAS)
  @ApiOperation({ summary: 'Obtener lista paginada de marcas' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (por defecto: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elementos por página (por defecto: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de marcas.',
    type: RespuestaFindAllPaginatedMarcasDTO,
  })
  findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<RespuestaFindAllPaginatedMarcasDTO> {
    return this.marcasService.findAllPaginated(paginationDto);
  }

  // ────────────────────────────────
  // 🔍 OBTENER MARCA POR ID
  // ────────────────────────────────
  @Get(':id')
  @PermisoRequerido(PermisosEnum.VER_MARCAS)
  @ApiOperation({ summary: 'Obtener una marca por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID numérico de la marca',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Marca encontrada.',
    type: MarcaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Marca no encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<MarcaResponseDto> {
    return this.marcasService.findOne(id);
  }

  // ────────────────────────────────
  // ✏️ ACTUALIZAR MARCA
  // ────────────────────────────────
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = extname(file.originalname);
          cb(null, `logo-${uniqueSuffix}${extension}`);
        },
      }),
    }),
  )
  @PermisoRequerido(PermisosEnum.MODIFICAR_MARCAS)
  @ApiOperation({ summary: 'Actualizar una marca existente' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string' },
        logo: { type: 'string', format: 'binary' },
        lineasId: { type: 'array', items: { type: 'number' } },
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la marca a actualizar',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Marca actualizada exitosamente.',
    type: MarcaResponseDto,
  }) // Usar tipo mapeado
  @ApiResponse({ status: 404, description: 'Marca no encontrada.' })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: El nuevo nombre de marca ya existe.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMarcaDto: UpdateMarcaDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUsuario,
  ): Promise<MarcaResponseDto> {
    if (file) {
      updateMarcaDto.logo = file.filename;
    }
    console.log(
      '[MarcasController UPDATE] DTO recibido y modificado:',
      updateMarcaDto,
    );
    console.log('[MarcasController UPDATE] Archivo recibido:', file);
    // Si no se sube un nuevo logo, updateMarcaDto.logo será undefined
    // y el servicio/repositorio no actualizarán ese campo
    return this.marcasService.update(id, updateMarcaDto);
  }

  // ────────────────────────────────
  // ❌ ELIMINAR MARCA
  // ────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @PermisoRequerido(PermisosEnum.ELIMINAR_MARCAS)
  @ApiOperation({ summary: 'Eliminar (soft delete) una marca por ID' })
  @ApiParam({ name: 'id', description: 'ID de la marca a eliminar' })
  @ApiResponse({
    status: 204,
    description: 'Marca eliminada exitosamente.',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUsuario,
  ): Promise<void> {
    await this.marcasService.remove(id, req.usuario);
  }
}
