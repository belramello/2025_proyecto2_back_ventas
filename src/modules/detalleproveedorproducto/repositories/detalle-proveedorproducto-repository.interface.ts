import { CreateDetalleProveedorProductoDto } from '../dto/create-detalleproveedorproducto.dto';
import { DetalleProveedorProducto } from '../entities/detalleproveedorproducto.entity';

export interface IDetalleProveedorProductoRepository {
  create(createDetalleVentaDto: CreateDetalleProveedorProductoDto): Promise<DetalleProveedorProducto>;
  findOne(id: number): Promise<DetalleProveedorProducto | null>;
  findAllByProducto(productoId: number): Promise<DetalleProveedorProducto[] | null>;
  save(detalle: DetalleProveedorProducto): Promise<DetalleProveedorProducto>;
}