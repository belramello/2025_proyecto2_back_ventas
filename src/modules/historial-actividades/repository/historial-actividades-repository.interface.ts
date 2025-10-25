import { CreateHistorialActividadesDto } from '../dto/create-historial-actividades.dto';
import { HistorialActividades } from '../entities/historial-actividade.entity';

export interface IHistorialActividadesRepository {
  create(data: CreateHistorialActividadesDto): Promise<HistorialActividades>;
  findAllPaginated(
    page: number,
    limit: number,
    search?: string,
    action?: string,
  ): Promise<{
    historial: HistorialActividades[];
    total: number;
    page: number;
    lastPage: number;
  }>;
}
