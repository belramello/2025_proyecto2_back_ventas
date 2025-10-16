import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('marcas')
export class MarcasController {
  constructor(private readonly marcasService: MarcasService) {}

  @Post()
  @UseInterceptors(FileInterceptor('logo', { storage: diskStorage({ destination: './uploads/logos', filename: (req, file, cb) => { cb(null, Date.now() + extname(file.originalname)); } }) }))
  create(@Body() createMarcaDto: CreateMarcaDto, @UploadedFile() file: Express.Multer.File) {
    const logoPath = file ? `uploads/logos/${file.filename}` : undefined;
    return this.marcasService.create(createMarcaDto, logoPath);
  }

  @Get()
  findAll() {
    return this.marcasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marcasService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('logo', { storage: diskStorage({ destination: './uploads/logos', filename: (req, file, cb) => { cb(null, Date.now() + extname(file.originalname)); } }) }))
  update(@Param('id') id: string, @Body() updateMarcaDto: UpdateMarcaDto, @UploadedFile() file: Express.Multer.File) {
    const logoPath = file ? `uploads/logos/${file.filename}` : undefined;
    return this.marcasService.update(+id, updateMarcaDto, logoPath);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marcasService.remove(+id);
  }
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.marcasService.restore(+id);
  }
}