import { CreateHistorialActividadesDto } from '../dto/create-historial-actividade.dto';
import { HistorialActividades } from '../entities/historial-actividade.entity';

export interface IHistorialActividadesRepository {
  create(data: CreateHistorialActividadesDto): Promise<HistorialActividades>;
  findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{
    historial: HistorialActividades[];
    total: number;
    page: number;
    lastPage: number;
  }>;
}
