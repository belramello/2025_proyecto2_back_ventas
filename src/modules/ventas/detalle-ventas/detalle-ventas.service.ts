import { Inject, Injectable } from '@nestjs/common';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { Venta } from '../entities/venta.entity';
import { DetalleVentasValidator } from './helpers/detalle-venta.validator';
import { DetalleVentaDto } from './dto/detalle-venta.dto';
import type { IDetalleVentasRepository } from './repositories/detalle-ventas-repository.interface';
import { ProductosService } from 'src/modules/productos/productos.service';

@Injectable()
export class DetalleVentasService {
  constructor(
    @Inject('IDetalleVentasRepository')
    private readonly detalleVentasRepository: IDetalleVentasRepository,
    private readonly detalleVentasValidator: DetalleVentasValidator,
    private readonly productosService: ProductosService,
  ) {}

  async createDetalles(
    venta: Venta,
    detallesDto: DetalleVentaDto[],
  ): Promise<{ total: number }> {
    let total = 0;
    //Itero sobre todos los detalles recibidos para...
    for (const item of detallesDto) {
      //validar que exista el producto del id recibido y tenga stock disponible para la cantidad.
      const producto =
        await this.detalleVentasValidator.validateExistenciaYStock(
          item.productoId,
          item.cantidad,
        );
      //calculo el total para los detalles recibidos.
      const precioUnitario = producto.precio;
      total += precioUnitario * item.cantidad;
      console;
      // Crear y guardar el detalle
      await this.create({
        venta,
        producto,
        cantidad: item.cantidad,
        precioUnitario,
      });
      //Actualia el stock para el producto.
      console.log('producto actualizado');
      await this.productosService.decrementarStock(producto, item.cantidad);
    }
    return { total };
  }

  async create(createDetalleVentaDto: CreateDetalleVentaDto) {
    return await this.detalleVentasRepository.create(createDetalleVentaDto);
  }

  findAll() {
    return `This action returns all detalleVentas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} detalleVenta`;
  }
}
