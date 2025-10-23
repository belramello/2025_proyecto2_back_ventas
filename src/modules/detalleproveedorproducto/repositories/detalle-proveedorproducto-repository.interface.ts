import { CreateDetalleProveedorRepositoryDto } from '../dto/create-detalle-proveedor-repository.dto';
import { DetalleProveedorProducto } from '../entities/detalleproveedorproducto.entity';

export interface IDetalleProveedorProductoRepository {
  create(
    createDetalleVentaDto: CreateDetalleProveedorRepositoryDto,
  ): Promise<DetalleProveedorProducto>;
  findOne(id: number): Promise<DetalleProveedorProducto | null>;
  findAllByProducto(
    productoId: number,
  ): Promise<DetalleProveedorProducto[] | null>;
  save(detalle: DetalleProveedorProducto): Promise<DetalleProveedorProducto>;
}
