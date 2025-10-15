import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { Producto } from '../entities/producto.entity';
import { IProductosRepository } from './producto-repository.interface';
import { Repository, UpdateResult } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { FindOneProductoDto } from '../dto/findOne-producto.dto';
import { DeleteProductoDto } from '../dto/delete-producto.dto';

export class ProductosRepository implements IProductosRepository {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    try {
      const producto = this.productoRepository.create({
        ...createProductoDto,
      });
      return await this.productoRepository.save(producto);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear el producto: ${error.message}`,
      );
    }
  }

  async findAllByUsuarioId(usuarioId: number): Promise<Producto[]> {
    try {
      return await this.productoRepository.find({
        where: { usuarioId },
        order: { fechaCreacion: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al encontrar los productos del usuario con ID ${usuarioId}: ${error.message}`,
      );
    }
  }

  async findOne(data: FindOneProductoDto): Promise<Producto | null> {
    try {
      const producto = await this.productoRepository.findOne({
        where: { id: data.id },
      });
      return producto;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al buscar el producto con ID ${data.id}: ${error.message}`,
      );
    }
  }

  async findByCodigo(codigo: string): Promise<Producto | null> {
    try {
      const producto = await this.productoRepository
        .createQueryBuilder('producto')
        .where('producto.codigo = :codigo', { codigo })
        .getOne();
      console.log(producto);
      return producto;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al buscar el producto con codigo ${codigo}: ${error.message}`,
      );
    }
  }

  async decrementStock(id: number, cantidad: number): Promise<UpdateResult> {
    try {
      const result = await this.productoRepository
        .createQueryBuilder()
        .update(Producto)
        .set({ stock: () => 'stock - :cantidad' })
        .where('id = :id AND stock >= :cantidad', { id, cantidad })
        .execute();

      if (result.affected === 0) {
        throw new InternalServerErrorException(
          `No se pudo descontar stock: producto no existe o stock insuficiente.`,
        );
      }

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar el producto con ID ${id}: ${error.message}`,
      );
    }
  }

  async update(id: number, data: UpdateProductoDto): Promise<UpdateResult> {
    try {
      return await this.productoRepository.update(id, {
        ...data,
        fechaActualizacion: new Date(),
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar el producto con ID ${id}: ${error.message}`,
      );
    }
  }

  async remove(deleteProductodto: DeleteProductoDto): Promise<UpdateResult> {
    try {
      // Soft delete:  marca fechaEliminacion
      return await this.productoRepository.update(deleteProductodto.id, {
        fechaEliminacion: new Date(),
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al eliminar (soft delete) el producto con ID ${deleteProductodto.id}: ${error.message}`,
      );
    }
  }
}
