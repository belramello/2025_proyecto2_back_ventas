import {
  Injectable,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { Producto } from '../entities/producto.entity';
import { ProductosService } from '../productos.service';

@Injectable()
export class ProductosValidator {
  constructor(
    @Inject(forwardRef(() => ProductosService))
    private readonly productosService: ProductosService,
  ) {}
  validateStock(producto: Producto, cantidad: number) {
    if (producto.stock < cantidad) {
      throw new BadRequestException(
        `Stock insuficiente para producto ${producto.id}`,
      );
    }
  }

  async validateProductoConCodigo(codigo: string): Promise<void> {
    const producto = await this.productosService.findOneByCodigo(codigo);
    if (producto) {
      throw new BadRequestException(
        `El código ${codigo} ya está en uso por otro producto.`,
      );
    }
  }
}
