import {
  Injectable,
  Inject,
  NotFoundException,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { Marca } from '../entities/marca.entity';
import { MarcasService } from '../marcas.service';
import { LineasValidator } from 'src/modules/lineas/helpers/lineas-validator';
import { Linea } from 'src/modules/lineas/entities/linea.entity';

@Injectable()
export class MarcaValidator {
  constructor(
    @Inject(forwardRef(() => LineasValidator))
    private readonly lineaValidator: LineasValidator,
    @Inject(forwardRef(() => MarcasService))
    private readonly marcaService: MarcasService,
  ) {}

  async validateNombreUnico(nombre: string): Promise<void> {
    const marca = await this.marcaService.findOneByNombre(nombre);
    if (marca) throw new BadRequestException('El nombre de la marca ya existe');
  }

  async validateLineasExistentes(lineasId: number[]): Promise<Linea[]> {
    const lineas = await this.lineaValidator.validateLineasExistentes(lineasId);
    return lineas;
  }

  async validateExistencia(id: number): Promise<Marca> {
    const marca = await this.marcaService.findOneForServices(id);
    if (!marca) throw new NotFoundException(`La marca con ID ${id} no existe`);
    return marca;
  }
}
