import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetalleproveedorproductoService } from './detalleproveedorproducto.service';
import { CreateDetalleProveedorProductoDto } from './dto/create-detalleproveedorproducto.dto';

@Controller('detalleproveedorproducto')
export class DetalleproveedorproductoController {
  constructor(private readonly detalleproveedorproductoService: DetalleproveedorproductoService) {}

  @Post()
  create(@Body() createDetalleproveedorproductoDto: CreateDetalleProveedorProductoDto) {
    return this.detalleproveedorproductoService.create(createDetalleproveedorproductoDto);
  }

  @Get()
  findAll() {
    return this.detalleproveedorproductoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleproveedorproductoService.findOne(+id);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detalleproveedorproductoService.remove(+id);
  }
}
