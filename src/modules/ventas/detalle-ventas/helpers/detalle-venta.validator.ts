import { BadRequestException, Injectable } from '@nestjs/common';
import { Producto } from 'src/modules/productos/entities/producto.entity';
import { ProductosService } from 'src/modules/productos/productos.service';

@Injectable()
export class DetalleVentasValidator {
  constructor(private readonly productosService: ProductosService) {}

  async validateExistenciaYStock(productoId: number, cantidad: number) {
    const producto = await this.validateProductos(productoId);
    await this.validateStock(producto, cantidad);
    return producto;
  }

  async validateProductos(productoId: number): Promise<Producto> {
    const producto = await this.productosService.findOne(productoId);
    if (!producto) {
      throw new BadRequestException(`Producto no existe: ${productoId}`);
    }
    return producto;
  }

  async validateStock(producto: Producto, cantidad: number) {
    if (producto.stock < cantidad) {
      throw new BadRequestException(
        `Stock insuficiente para producto ${producto.id}`,
      );
    }
  }
}
