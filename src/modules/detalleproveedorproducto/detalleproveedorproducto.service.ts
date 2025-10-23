import { Injectable } from '@nestjs/common';
import { CreateDetalleProveedorProductoDto } from './dto/create-detalleproveedorproducto.dto';

@Injectable()
export class DetalleproveedorproductoService {
  create(createDetalleProveedorProductoDto: CreateDetalleProveedorProductoDto) {
    return 'This action adds a new detalleproveedorproducto';
  }

  findAll() {
    return `This action returns all detalleproveedorproducto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} detalleproveedorproducto`;
  }



  remove(id: number) {
    return `This action removes a #${id} detalleproveedorproducto`;
  }
}
