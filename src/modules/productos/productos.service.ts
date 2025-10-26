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
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class ProductosService {
  constructor(
    @Inject('IProductosRepository')
    private readonly productosRepository: IProductosRepository,
    private readonly productoMapper: ProductoMapper,
    private readonly validator: ProductosValidator,
    private readonly historialActividades: HistorialActividadesService,
  ) {}

  async create(createProductoDto: CreateProductoDto, usuario: Usuario) {
    await this.validator.validateProductoConCodigo(createProductoDto.codigo);
    const marca = await this.validator.validateMarcaExistente(
      createProductoDto.marcaId,
    );
    const linea = await this.validator.validateLineaExistente(
      createProductoDto.lineaId,
    );
    await this.validator.validateLineaParaMarca(linea, marca);
    // Registro historial exitoso
    await this.historialActividades.create({
      usuario: usuario.id,
      accionId: 7, // Acción de creación de producto
      estadoId: 1, // Exitoso
    });
    return this.productosRepository.create(
      createProductoDto,
      usuario,
      marca,
      linea,
    );
  }

  async findAllPaginated(
    paginationDto: PaginationProductoDto,
  ): Promise<RespuestaFindAllPaginatedProductoDTO> {
    const { limit = 10, page = 1 } = paginationDto;
    return this.productoMapper.toRespuestaFindAllPaginatedProductoDTO(
      await this.productosRepository.findAllPaginated(page, limit),
    );
  }

  async findOne(id: number): Promise<Producto | null> {
    return this.productosRepository.findOne(id);
  }

  async findOneByCodigo(codigo: string): Promise<Producto | null> {
    return await this.productosRepository.findByCodigo(codigo);
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
    usuarioId: number,
  ) {
    try {
      const producto = this.productosRepository.update(
        id,
        updateProductoDto,
        usuarioId,
      );

      // Registro actualización exitosa
      await this.historialActividades.create({
        usuario: usuarioId,
        accionId: 8, // Acción de borrado de producto
        estadoId: 1, // Exitoso
      });

      return producto;
    } catch (error) {
      // Registro historial fallido
      await this.historialActividades.create({
        usuario: usuarioId,
        accionId: 8,
        estadoId: 2, // Fallido
      });

      throw error; // Opcional: volver a lanzar el error
    }
  }

  async decrementarStock(producto: Producto, cantidad: number): Promise<void> {
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
