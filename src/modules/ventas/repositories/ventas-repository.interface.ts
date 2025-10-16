import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { CreateVentaDto } from '../dto/create-venta.dto';
import { Venta } from '../entities/venta.entity';

export interface IVentasRepository {
  create(createVentaDto: CreateVentaDto, usuario: Usuario): Promise<Venta>;
  findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{
    ventas: Venta[];
    total: number;
    page: number;
    lastPage: number;
  }>;
  findOne(ventaId: number): Promise<Venta | null>;
}
