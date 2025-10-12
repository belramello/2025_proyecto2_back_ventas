import { Inject, Injectable } from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import * as ventasRepositoryInterface from './repositories/ventas-repository.interface';
import { Transactional } from 'typeorm-transactional';
import { VentasMapper } from './mappers/ventas.mapper';
import { RespuestaCreateVentaDto } from './dto/respuesta-create-venta.dto';

@Injectable()
export class VentasService {
  constructor(
    @Inject('IVentasRepository')
    private readonly ventasRepository: ventasRepositoryInterface.IVentasRepository,
    private readonly ventasMapper: VentasMapper,
  ) {}
  //Falta agregar vendedor id
  @Transactional()
  async create(
    createVentaDto: CreateVentaDto,
  ): Promise<RespuestaCreateVentaDto> {
    const venta = await this.ventasRepository.create(createVentaDto);
    return this.ventasMapper.toResponseDto(venta);
  }

  findAll() {
    return `This action returns all ventas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} venta`;
  }
}
