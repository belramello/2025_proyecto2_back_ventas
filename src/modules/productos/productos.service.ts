import { Injectable, Inject } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { DeleteProductoDto } from './dto/delete-producto.dto';
import type { IProductosRepository } from './repository/producto-repository.interface';
import { PaginationProductoDto } from './dto/pagination.dto';
import { RespuestaFindAllPaginatedProductoDTO } from './dto/respuesta-find-all-paginated.dto';
import { ProductoMapper } from './mapper/producto.mapper';

@Injectable()
export class ProductosService {
  constructor(
    @Inject('IProductosRepository')
    private readonly productosRepository: IProductosRepository,
    private readonly productoMapper: ProductoMapper,
  ) {}

  async create(createProductoDto: CreateProductoDto) {
    return this.productosRepository.create(createProductoDto);
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

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    return this.productosRepository.update(id, updateProductoDto);
  }

  async remove(deleteProductoDto: DeleteProductoDto) {
    return this.productosRepository.remove(deleteProductoDto);
  }
}
