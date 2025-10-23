import { Injectable } from '@nestjs/common';
import { CreateLineaDto } from './dto/create-linea.dto';
import { UpdateLineaDto } from './dto/update-linea.dto';

@Injectable()
export class LineasService {
  create(createLineaDto: CreateLineaDto) {
    return 'This action adds a new linea';
  }

  findAll() {
    return `This action returns all lineas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} linea`;
  }

  update(id: number, updateLineaDto: UpdateLineaDto) {
    return `This action updates a #${id} linea`;
  }

  remove(id: number) {
    return `This action removes a #${id} linea`;
  }
}
