import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UpdateMarcaDto } from '../dto/update-marca.dto';
import { Marca } from '../entities/marca.entity';
import { MarcaValidator } from './marcas-validator';
import { Linea } from 'src/modules/lineas/entities/linea.entity';
import * as path from 'path';

@Injectable()
export class MarcasUpdater {
  constructor(
    @Inject(forwardRef(() => MarcaValidator))
    private readonly marcaValidator: MarcaValidator,
  ) {}
  async updateMarca(
    marca: Marca,
    updateMarcaDto: UpdateMarcaDto,
  ): Promise<Marca> {
    if (
      updateMarcaDto.nombre &&
      updateMarcaDto.nombre.trim() !== marca.nombre
    ) {
      await this.marcaValidator.validateNombreUnico(updateMarcaDto.nombre);
      marca.nombre = updateMarcaDto.nombre.trim();
    }
    if (typeof updateMarcaDto.descripcion === 'string') {
      const nuevaDescripcion = updateMarcaDto.descripcion.trim();
      if (nuevaDescripcion !== marca.descripcion) {
        marca.descripcion = nuevaDescripcion;
      }
    }
    let lineasToAssign: Linea[] | undefined = undefined;
    if (Array.isArray(updateMarcaDto.lineasId)) {
      lineasToAssign = await this.marcaValidator.validateLineasExistentes(
        updateMarcaDto.lineasId,
      );
    }
    if (lineasToAssign) marca.lineas = lineasToAssign;
    const logoAntiguo = marca.logo;
    const logoNuevo = updateMarcaDto.logo;
    if (logoNuevo && logoAntiguo && logoNuevo !== logoAntiguo) {
      const rutaLogoAntiguo = path.join(
        process.cwd(),
        'uploads',
        'logos',
        logoAntiguo,
      );
    }
    return marca;
  }
}
