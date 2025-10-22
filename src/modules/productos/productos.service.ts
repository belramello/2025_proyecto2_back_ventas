import { Injectable, Inject } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { DeleteProductoDto } from './dto/delete-producto.dto';
import type { IProductosRepository } from './repository/producto-repository.interface';
import { PaginationProductoDto } from './dto/pagination.dto';
import { RespuestaFindAllPaginatedProductoDTO } from './dto/respuesta-find-all-paginated.dto';
import { ProductoMapper } from './mapper/producto.mapper';
import { Producto } from './entities/producto.entity';
import { ProductosValidator } from './helpers/productos-validator';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';

@Injectable()
export class ProductosService {
  constructor(
    @Inject('IProductosRepository')
    private readonly productosRepository: IProductosRepository,
    private readonly productoMapper: ProductoMapper,
    private readonly validator: ProductosValidator,
    private readonly historialActividades: HistorialActividadesService,
  ) {}

  async create(createProductoDto: CreateProductoDto, usuarioId: number) {
    try {
      const producto = await this.productosRepository.create(
        createProductoDto,
        usuarioId,
      );

      // Registro historial exitoso
      await this.historialActividades.create({
        usuario: usuarioId,
        accionId: 7, // Acción de creación de producto
        estadoId: 1, // Exitoso
      });

      return producto;
    } catch (error) {
      // Registro historial fallido
      await this.historialActividades.create({
        usuario: usuarioId,
        accionId: 7,
        estadoId: 2, // Fallido
      });

      throw error; // Opcional: volver a lanzar el error
    }
  }

  async findAll() {
    return this.productosRepository.findAllByUsuarioId(1); // Temporal
  }

  async findAllPaginated(
    paginationDto: PaginationProductoDto,
  ): Promise<RespuestaFindAllPaginatedProductoDTO> {
    const { limit = 10, page = 1 } = paginationDto;
    return this.productoMapper.toRespuestaFindAllPaginatedProductoDTO(
      await this.productosRepository.findAllPaginated(page, limit),
    );
  }

  async findOne(id: number) {
    return this.productosRepository.findOne({ id });
  }

  async findOneByCodigo(codigo: string) {
    return await this.productosRepository.findByCodigo(codigo);
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
    usuarioId: number,
  ) {
    return this.productosRepository.update(id, updateProductoDto, usuarioId);
  }

  async decrementarStock(producto: Producto, cantidad: number) {
    this.validator.validateStock(producto, cantidad);
    await this.productosRepository.decrementStock(producto.id, cantidad);
  }

  async remove(deleteProductoDto: DeleteProductoDto): Promise<any> {
    try {
      const producto = await this.productosRepository.remove(deleteProductoDto);

      // Registro borrado exitoso
      await this.historialActividades.create({
        usuario: deleteProductoDto.usuarioId as unknown as number,
        accionId: 9, // Acción de borrado de producto
        estadoId: 1, // Exitoso
      });

      return producto;
    } catch (error) {
      // Registro historial fallido
      await this.historialActividades.create({
        usuario: deleteProductoDto.usuarioId as unknown as number,
        accionId: 9,
        estadoId: 2, // Fallido
      });

      throw error; // Opcional: volver a lanzar el error
    }
  }
}
