import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleProveedorProducto } from '../entities/detalleproveedorproducto.entity';
import { IDetalleProveedorProductoRepository } from './detalle-proveedorproducto-repository.interface';
import { CreateDetalleProveedorRepositoryDto } from '../dto/create-detalle-proveedor-repository.dto';

@Injectable()
export class DetalleProveedorProductoRepository
  implements IDetalleProveedorProductoRepository
{
  constructor(
    @InjectRepository(DetalleProveedorProducto)
    private readonly detalleRepository: Repository<DetalleProveedorProducto>,
  ) {}

  async create(
    createDetalleDto: CreateDetalleProveedorRepositoryDto,
  ): Promise<DetalleProveedorProducto> {
    try {
      const detalle = this.detalleRepository.create(createDetalleDto);
      return await this.detalleRepository.save(detalle);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear el detalleProveedorProducto: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<DetalleProveedorProducto | null> {
    try {
      const detalle = await this.detalleRepository
        .createQueryBuilder('detalle')
        .leftJoinAndSelect(
          'detalle.producto',
          'producto',
          '1=1 OR producto.fechaEliminacion IS NOT NULL',
        )
        .leftJoinAndSelect('detalle.proveedor', 'proveedor')
        .where('detalle.id = :id', { id })
        .withDeleted()
        .getOne();
      return detalle || null;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener el detalleProveedorProducto: ${error.message}`,
      );
    }
  }

  async findAllByProducto(
    productoId: number,
  ): Promise<DetalleProveedorProducto[]> {
    try {
      const detalles = await this.detalleRepository
        .createQueryBuilder('detalle')
        .leftJoinAndSelect(
          'detalle.producto',
          'producto',
          '1=1 OR producto.fechaEliminacion IS NOT NULL',
        )
        .leftJoinAndSelect('detalle.proveedor', 'proveedor')
        .where('producto.id = :productoId', { productoId })
        .withDeleted()
        .getMany();
      return detalles;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener los detalles del producto ${productoId}: ${error.message}`,
      );
    }
  }
  async save(
    detalle: DetalleProveedorProducto,
  ): Promise<DetalleProveedorProducto> {
    try {
      return await this.detalleRepository.save(detalle);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al guardar el detalleProveedorProducto: ${error.message}`,
      );
    }
  }
}
