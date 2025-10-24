import { Linea } from '../entities/linea.entity';
import { Marca } from 'src/modules/marcas/entities/marca.entity';

export interface ILineaRepository {
  create(name: string): Promise<Linea>;
  findById(id: number): Promise<Linea | null>;
  findWithBrands(id: number): Promise<Linea | null>;
  addBrand(linea: Linea, marca: Marca): Promise<Linea>;
  delete(id: number): Promise<void>;
}
