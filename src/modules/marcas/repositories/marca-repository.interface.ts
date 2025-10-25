import { FindOneMarcaDto } from '../dto/findOne-marca.dto';
import { Marca } from '../entities/marca.entity';

export interface MarcaRepositoryInterface {
  findByNombre(nombre: string): Promise<Marca | null>;
  findOne(data: FindOneMarcaDto): Promise<Marca | null>;
}
