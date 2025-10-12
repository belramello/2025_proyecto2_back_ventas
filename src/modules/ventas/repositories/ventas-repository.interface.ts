import { CreateVentaDto } from '../dto/create-venta.dto';
import { Venta } from '../entities/venta.entity';

export interface IVentasRepository {
  create(createVentaDto: CreateVentaDto): Promise<Venta>;
  findAll(): Promise<Venta[]>;
  findOne(ventaId: number): Promise<Venta | null>;
}
