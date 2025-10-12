import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { DeleteProductoDto } from './dto/delete-producto.dto';
import type { IProductosRepository } from './repository/producto-repository.interface';
import { ProductosValidator } from './helpers/productos-validator';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  constructor(
    @Inject('IProductosRepository')
    private readonly productosRepository: IProductosRepository,
    private readonly validator: ProductosValidator,
  ) {}

  async create(createProductoDto: CreateProductoDto) {
    return this.productosRepository.create(createProductoDto);
  }

  async findAll() {
    return this.productosRepository.findAllByUsuarioId(1); // Temporal
  }

  async findOne(id: number) {
    return this.productosRepository.findOne({ id });
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    return this.productosRepository.update(id, updateProductoDto);
  }

  async decrementarStock(producto: Producto, cantidad: number) {
    this.validator.validateStock(producto, cantidad);
    await this.productosRepository.decrementStock(producto.id, cantidad);
  }

  async remove(deleteProductoDto: DeleteProductoDto) {
    return this.productosRepository.remove(deleteProductoDto);
  }
}
