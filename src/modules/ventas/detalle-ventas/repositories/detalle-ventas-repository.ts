import { InjectRepository } from '@nestjs/typeorm';
import { DetalleVenta } from '../entities/detalle-venta.entity';
import { Repository } from 'typeorm';
import { CreateDetalleVentaDto } from '../dto/create-detalle-venta.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IDetalleVentasRepository } from './detalle-ventas-repository.interface';
import { RespuestaFindOneDetalleVentaDto } from '../dto/respuesta-find-one-detalle-venta.dto';

export class DetalleVentasRepository implements IDetalleVentasRepository {
  constructor(
    @InjectRepository(DetalleVenta)
    private readonly detalleVentaRepository: Repository<DetalleVenta>,
  ) {}

  async create(
    createDetalleVentaDto: CreateDetalleVentaDto,
  ): Promise<DetalleVenta> {
    try {
      const detalle = this.detalleVentaRepository.create(createDetalleVentaDto);
      return await this.detalleVentaRepository.save(detalle);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear el detalleVenta: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<DetalleVenta | null> {
    try {
      const detalle = await this.detalleVentaRepository.findOne({
        where: { id },
        relations: ['producto'],
      });
      return detalle;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener el detalleVenta: ${error.message}`,
      );
    }
  }

  async findAllByVenta(ventaId: number): Promise<DetalleVenta[]> {
    try {
      const detalles = await this.detalleVentaRepository.find({
        where: { venta: { id: ventaId } },
        relations: ['producto'],
      });
      return detalles;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener los detalles de la venta ${ventaId}: ${error.message}`,
      );
    }
  }
}
