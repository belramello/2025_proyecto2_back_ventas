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
  HttpStatus, // Importar HttpCode y HttpStatus
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
import { PaginationDto } from './dto/pagination.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RespuestaFindAllPaginatedMarcasDTO } from './dto/respuesta-find-all-paginated-marcas.dto';
import { MarcaResponseDto } from './dto/marca-response.dto';

@ApiTags('Marcas')
@UseGuards(AuthGuard)
@Controller('marcas')
export class MarcasController {
  constructor(private readonly marcasService: MarcasService) {}

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
      // fileFilter: ... (opcional para validar tipo/tamaño)
    }),
  )
  @PermisoRequerido(PermisosEnum.CREAR_MARCAS)
  @ApiOperation({ summary: 'Crear una nueva marca' })
  @ApiBody({ type: CreateMarcaDto })
  @ApiResponse({
    status: 201,
    description: 'Marca creada exitosamente.',
    type: MarcaResponseDto,
  }) // Usar tipo mapeado
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos (ej. nombre requerido, formato incorrecto).',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: El nombre de la marca ya existe.',
  })
  create(
    @Body() createMarcaDto: CreateMarcaDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MarcaResponseDto> {
    // Especificar tipo de retorno
    if (file) {
      createMarcaDto.logo = file.filename; // Asignar solo el nombre del archivo
    }
    return this.marcasService.create(createMarcaDto);
  }
  @PermisoRequerido(PermisosEnum.VER_MARCAS)
  @Get()
  @PermisoRequerido(PermisosEnum.VER_MARCAS)
  @ApiOperation({ summary: 'Obtener lista paginada de marcas' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (defecto: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elementos por página (defecto: 10)',
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
  @PermisoRequerido(PermisosEnum.VER_MARCAS)
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
  }) // Usar tipo mapeado
  @ApiResponse({ status: 404, description: 'Marca no encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<MarcaResponseDto> {
    return this.marcasService.findOne(id);
  }

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
  @ApiParam({
    name: 'id',
    description: 'ID de la marca a actualizar',
    type: Number,
  })
  @ApiBody({ type: UpdateMarcaDto })
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMarcaDto: UpdateMarcaDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MarcaResponseDto> {
    updateMarcaDto.id = id;
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

  @PermisoRequerido(PermisosEnum.ELIMINAR_MARCAS)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Establecer código 204 para delete exitoso
  @PermisoRequerido(PermisosEnum.ELIMINAR_MARCAS)
  @ApiOperation({ summary: 'Eliminar (soft delete) una marca por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la marca a eliminar',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'Marca eliminada (lógicamente) exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Marca no encontrada.' })
  @ApiResponse({
    status: 409,
    description:
      'Conflicto: No se puede eliminar si tiene productos asociados.',
  }) // Anticipar futuro error
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.marcasService.remove(id);
    // No retornamos nada para que Nest envíe 204
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK) // Status 200 para restore exitoso
  // TODO: Agregar @PermisoRequerido si aplica
  @ApiOperation({ summary: 'Restaurar una marca eliminada lógicamente' })
  @ApiParam({
    name: 'id',
    description: 'ID de la marca a restaurar',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Marca restaurada exitosamente.' })
  @ApiResponse({
    status: 404,
    description: 'Marca no encontrada o no eliminada.',
  })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.marcasService.restore(id);
    // No retornamos nada para que Nest envíe 200
  }
}
