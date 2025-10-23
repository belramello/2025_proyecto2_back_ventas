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

// Tipo propio para archivo de Multer
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

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
          cb(null, Date.now() + extname(file.originalname));
        },
      }),
    }),
  )
  @PermisoRequerido(PermisosEnum.CREAR_MARCAS)
  create(
    @Body() createMarcaDto: CreateMarcaDto,
    @UploadedFile() file?: MulterFile, // <-- cambio clave
  ) {
    const logoPath = file ? `uploads/logos/${file.filename}` : undefined;
    return this.marcasService.create(createMarcaDto, logoPath);
  }

  @PermisoRequerido(PermisosEnum.VER_MARCAS)
  @Get()
  findAll() {
    return this.marcasService.findAll();
  }

  @PermisoRequerido(PermisosEnum.VER_MARCAS)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marcasService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (req, file, cb) => {
          cb(null, Date.now() + extname(file.originalname));
        },
      }),
    }),
  )
  @PermisoRequerido(PermisosEnum.MODIFICAR_MARCAS)
  update(
    @Param('id') id: string,
    @Body() updateMarcaDto: UpdateMarcaDto,
    @UploadedFile() file?: MulterFile, // <-- cambio clave
  ) {
    const logoPath = file ? `uploads/logos/${file.filename}` : undefined;
    return this.marcasService.update(+id, updateMarcaDto, logoPath);
  }

  @PermisoRequerido(PermisosEnum.ELIMINAR_MARCAS)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.marcasService.remove(id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.marcasService.restore(+id);
  }
}
