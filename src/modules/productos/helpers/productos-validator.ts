import { Injectable, BadRequestException } from '@nestjs/common';
import { Producto } from '../entities/producto.entity';

@Injectable()
export class ProductosValidator {
  validateStock(producto: Producto, cantidad: number) {
    if (producto.stock < cantidad) {
      throw new BadRequestException(
        `Stock insuficiente para producto ${producto.id}`,
      );
    }
  }
}
