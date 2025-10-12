import { CreateDetalleVentaDto } from '../dto/create-detalle-venta.dto';
import { DetalleVenta } from '../entities/detalle-venta.entity';

export interface IDetalleVentasRepository {
  create(createDetalleVentaDto: CreateDetalleVentaDto): Promise<DetalleVenta>;
  findAllByVenta(ventaId: number): Promise<any[]>;
}
