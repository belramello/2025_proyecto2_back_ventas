import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { Producto } from '../entities/producto.entity';
import { IProductosRepository } from './producto-repository.interface';
import { Repository, UpdateResult } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { DeleteProductoDto } from '../dto/delete-producto.dto';
import { Transactional } from 'typeorm-transactional';
import { DetalleProveedorProductoService } from 'src/modules/detalleproveedorproducto/detalleproveedorproducto.service';
import { CreateDetalleProveedorProductoServiceDto } from 'src/modules/detalleproveedorproducto/dto/create-detalle-proveedor-service.dto';
import { Marca } from 'src/modules/marcas/entities/marca.entity';
import { Linea } from 'src/modules/lineas/entities/linea.entity';

export class ProductosRepository implements IProductosRepository {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly detalleProveedorService: DetalleProveedorProductoService,
  ) {}

  @Transactional()
async create(createProductoDto: CreateProductoDto): Promise<Producto> {
  try {
    // Crear el producto y asignar relaciones por ID
    const producto = this.productoRepository.create({
      ...createProductoDto,
      marca: { id: createProductoDto.marcaId } as Marca,
      linea: { id: createProductoDto.lineaId } as Linea,
    });

    await this.productoRepository.save(producto);

    // Crear detalles de proveedor si existen
    const detallesServiceDto: CreateDetalleProveedorProductoServiceDto[] = (
      createProductoDto.detalleProveedores || []
    ).map((d) => ({
      codigo: d.codigo,
      proveedorId: d.proveedorId,
      producto,
    }));

    if (detallesServiceDto.length > 0) {
      await this.detalleProveedorService.createDetalles(detallesServiceDto);
    }

    // Devolver producto con relaciones cargadas
    return (await this.findOne(producto.id)) as Producto;
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

  async findOne(id: number): Promise<Producto | null> {
    try {
      const producto = await this.productoRepository
        .createQueryBuilder('producto')
        .leftJoinAndSelect('producto.detallesProveedor', 'detallesProveedor')
        .leftJoinAndSelect('detallesProveedor.proveedor', 'proveedor', '1=1')
        .leftJoinAndSelect('producto.marca', 'marca')
        .leftJoinAndSelect('producto.linea', 'linea')
        .where('producto.id = :id', { id: id })
        .withDeleted()
        .getOne();

      return producto;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al buscar el producto con ID ${id}: ${error.message}`,
      );
    }
  }

  async findByCodigo(codigo: string): Promise<Producto | null> {
    try {
      const producto = await this.productoRepository
        .createQueryBuilder('producto')
        .where('producto.codigo = :codigo', { codigo })
        .getOne();
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
      const [productos, total] = await this.productoRepository
        .createQueryBuilder('producto')
        .leftJoinAndSelect('producto.marca', 'marca')
        .leftJoinAndSelect('producto.linea', 'linea')
        .leftJoinAndSelect('producto.detallesProveedor', 'detallesProveedor')
        .leftJoinAndSelect('detallesProveedor.proveedor', 'proveedor')
        //.where('producto.fechaEliminacion IS NULL')
        //.andWhere('producto.marca IS NOT NULL')
        //.andWhere('producto.linea IS NOT NULL')
        .orderBy('producto.nombre', 'ASC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        productos,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al encontrar los productos paginados: ${error.message}`,
      );
    }
  }
}
