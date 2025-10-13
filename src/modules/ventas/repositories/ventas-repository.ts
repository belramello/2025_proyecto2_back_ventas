import { InjectRepository } from '@nestjs/typeorm';
import { IVentasRepository } from './ventas-repository.interface';
import { Venta } from '../entities/venta.entity';
import { Repository } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { DetalleVentasService } from '../detalle-ventas/detalle-ventas.service';
import { CreateVentaDto } from '../dto/create-venta.dto';

export class VentasRepository implements IVentasRepository {
  constructor(
    @InjectRepository(Venta)
    private readonly ventasRepository: Repository<Venta>,
    private readonly detalleVentaService: DetalleVentasService,
  ) {}

  @Transactional()
  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    try {
      //Crea la venta sin total ni detalles.
      const venta = this.ventasRepository.create({
        medioDePago: createVentaDto.medioDePago,
        total: 0,
      });
      await this.ventasRepository.save(venta);
      //Crear los detalles y validar productos/stock
      const { total } = await this.detalleVentaService.createDetalles(
        venta,
        createVentaDto.detalles,
      );

      //Actualizar total de la venta
      venta.total = total;
      await this.ventasRepository.save(venta);
      return venta;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear la venta: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{
    ventas: Venta[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    try {
      const query = this.ventasRepository
        .createQueryBuilder('venta')
        .leftJoinAndSelect('venta.detalleVentas', 'detalleVenta')
        .leftJoinAndSelect('detalleVenta.producto', 'producto')
        .orderBy('venta.fechaCreacion', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [ventas, total] = await query.getManyAndCount();

      return {
        ventas,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al encontrar las ventas paginadas: ${error.message}`,
      );
    }
  }

  async findOne(ventaId: number): Promise<Venta | null> {
    try {
      const venta = await this.ventasRepository
        .createQueryBuilder('venta')
        .leftJoinAndSelect('venta.detalleVentas', 'detalle')
        .leftJoinAndSelect('detalle.producto', 'producto')
        .where('venta.id = :ventaId', { ventaId })
        .getOne();

      if (!venta) {
        throw new NotFoundException(
          `No se encontró la venta con ID ${ventaId}`,
        );
      }
      return venta;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener la venta ${ventaId}: ${error.message}`,
      );
    }
  }
}
