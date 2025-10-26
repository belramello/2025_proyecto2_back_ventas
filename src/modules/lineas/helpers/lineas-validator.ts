import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LineasService } from '../lineas.service';
import { Linea } from '../entities/linea.entity';
import { Marca } from 'src/modules/marcas/entities/marca.entity';
@Injectable()
export class LineasValidator {
  constructor(private readonly lineaService: LineasService) {}

  async validateLineaExistente(lineaId: number): Promise<Linea> {
    const linea = await this.lineaService.findOne(lineaId);
    if (!linea) {
      throw new NotFoundException(`La línea con ID ${lineaId} no existe`);
    }
    return linea;
  }

  async validateLineasExistentes(lineasId: number[]): Promise<Linea[]> {
    const lineas = await Promise.all(
      lineasId.map((lineaId) => this.validateLineaExistente(lineaId)),
    );
    return lineas;
  }

  async validateLineaNoVinculadaAMarca(
    linea: Linea,
    marca: Marca,
  ): Promise<void> {
    const yaRelacionadas = linea.marcas.some((m) => m.id === marca.id);
    if (yaRelacionadas) {
      throw new BadRequestException('La marca ya está vinculada a la línea');
    }
  }

  async validateLineaVinculadaAMarca(
    linea: Linea,
    marca: Marca,
  ): Promise<void> {
    const yaRelacionadas = linea.marcas.some((m) => m.id === marca.id);
    if (!yaRelacionadas) {
      throw new BadRequestException('La marca no está vinculada a la línea');
    }
  }
}
