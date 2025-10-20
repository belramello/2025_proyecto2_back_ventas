import { Marca } from '../entities/marca.entity';

export interface MarcaRepositoryInterface {
  findByNombre(nombre: string): Promise<Marca | null>;
}
