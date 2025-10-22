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
        usuarioId: createProductoDto.usuarioId,
      });
      return await this.productoRepository.save(producto);
    } catch (error) {
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al crear el producto: ${error.message}`,
      );
    }
  }

  async findAllByUsuarioId(usuarioId: number): Promise<Producto[]> {
    try {
      return await this.productoRepository.find({
        where: { usuarioId: { id: usuarioId } },
        order: { fechaCreacion: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al actualizar el producto con ID ${id}: ${error.message}`,
      );
    }
  }

  async update(id: number, data: UpdateProductoDto): Promise<UpdateResult> {
    try {
      return await this.productoRepository.update(id, {
        ...data,
        fechaActualizacion: new Date(),
        usuarioId: data.usuarioId, // Ensure that usuarioId is of type number
      });
    } catch (error) {
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al actualizar el producto con ID ${id}: ${error.message}`,
      );
    }
  }

  async remove(deleteProductodto: DeleteProductoDto): Promise<UpdateResult> {
    try {
      // Soft delete:  marca fechaEliminacion
      return await this.productoRepository.update(deleteProductodto.id, {
        fechaEliminacion: new Date(),
        usuarioEliminacion: { id: deleteProductodto.usuarioId },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al eliminar (soft delete) el producto con ID ${deleteProductodto.id}: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{
    productos: Producto[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    try {
      const query = this.productoRepository
        .createQueryBuilder('producto')
        .where('producto.fechaEliminacion IS NULL'); // excluye soft-deleted

      query
        .orderBy('producto.nombre', 'ASC')
        .skip((page - 1) * limit)
        .take(limit);

      const [productos, total] = await query.getManyAndCount();

      return {
        productos,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al encontrar las ventas paginadas: ${error.message}`,
      );
    }
  }
}
