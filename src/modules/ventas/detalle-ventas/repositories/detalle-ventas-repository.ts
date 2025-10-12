import { InjectRepository } from '@nestjs/typeorm';
import { DetalleVenta } from '../entities/detalle-venta.entity';
import { Repository } from 'typeorm';
import { CreateDetalleVentaDto } from '../dto/create-detalle-venta.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { IDetalleVentasRepository } from './detalle-ventas-repository.interface';

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

  async findAllByVenta(ventaId: number): Promise<any[]> {
    try {
      const detalles = await this.detalleVentaRepository
        .createQueryBuilder('detalle')
        .innerJoinAndSelect('detalle.producto', 'producto')
        .innerJoinAndSelect('producto.marca', 'marca')
        .where('detalle.ventaId = :ventaId', { ventaId })
        .select([
          'detalle.id AS id',
          'detalle.cantidad AS cantidad',
          'detalle.precioUnitario AS precioUnitario',
          'producto.id AS productoId',
          'producto.nombre AS productoNombre',
          'marca.nombre AS marcaNombre',
          '(detalle.cantidad * detalle.precioUnitario) AS subtotal',
        ])
        .getRawMany();

      return detalles;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener los detalles de la venta ${ventaId}: ${error.message}`,
      );
    }
  }
}
