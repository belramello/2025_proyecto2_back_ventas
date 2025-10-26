import { CreateLineaDto } from '../dto/create-linea.dto';
import { Linea } from '../entities/linea.entity';
import { Marca } from '../../../modules/marcas/entities/marca.entity';

export interface ILineaRepository {
  create(createLineaDto: CreateLineaDto): Promise<Linea>;
  findOne(id: number): Promise<Linea | null>;
  añadirMarca(linea: Linea, marca: Marca): Promise<Linea>;
  delete(id: number): Promise<void>;

  findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{
    lineas: Linea[];
    total: number;
    page: number;
    lastPage: number;
  }>;
  findLineasPorMarca(marcaId: number): Promise<Linea[]>;
}
