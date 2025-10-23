import { CreateDetalleVentaDto } from '../dto/create-detalle-venta.dto';
import { RespuestaFindOneDetalleVentaDto } from '../dto/respuesta-find-one-detalle-venta.dto';
import { DetalleVenta } from '../entities/detalle-venta.entity';

export interface IDetalleVentasRepository {
  create(createDetalleVentaDto: CreateDetalleVentaDto): Promise<DetalleVenta>;
  findOne(id: number): Promise<DetalleVenta | null>;
  findAllByVenta(ventaId: number): Promise<DetalleVenta[] | null>;
}
