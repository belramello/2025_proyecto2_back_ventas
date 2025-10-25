/*import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';¡
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { Marca } from './entities/marca.entity';
import type { MarcaRepositoryInterface } from './repositories/marca-repository.interface';

@Injectable()
export class MarcasService {
  constructor(private readonly marcaRepository: MarcaRepositoryInterface) {}

  async create(
    createMarcaDto: CreateMarcaDto,
    logoPath?: string,
  ): Promise<Marca> {
    const marca = this.marcaRepository.create({
      ...createMarcaDto,
      logo: logoPath,
    });
    return this.marcaRepository.save(marca);
  }

  async findAll(): Promise<Marca[]> {
    return this.marcaRepository.find();
  }

  async findOne(id: number): Promise<Marca> {
    const marca = await this.marcaRepository.findOne({ id });
    if (!marca) throw new BadRequestException('Marca no encontrada');
    return marca;
  }

  async update(
    id: number,
    updateMarcaDto: UpdateMarcaDto,
    logoPath?: string,
  ): Promise<Marca> {
    const marca = await this.findOne(id);
    if (updateMarcaDto.nombre && updateMarcaDto.nombre !== marca.nombre) {
      const existing = await this.marcaRepository.findByNombre(
        updateMarcaDto.nombre,
      );
      if (existing) throw new ConflictException('Nombre ya registrado');
    }
    if (logoPath) updateMarcaDto['logo'] = logoPath;
    await this.marcaRepository.update(id, updateMarcaDto);
    return this.findOne(id);
  }
  async remove(id: number): Promise<void> {
    const marca = await this.findOne(id);

    //lógica para chequear productos asociados cuando lo pase belu
    await this.marcaRepository.softRemove(marca);
  }

  //Restaura una marca que fue borrada lógicamente.
  async restore(id: number): Promise<void> {
    const marca = await this.marcaRepository.findOne({
      // Buscamos en la base de datos, incluyendo los registros borrados lógicamente
      where: { id },
      withDeleted: true,
    });

    if (!marca) {
      throw new BadRequestException('Marca no encontrada');
    }

    if (!marca.deletedAt) {
      throw new BadRequestException('La marca no se encuentra eliminada');
    }

    await this.marcaRepository.restore(id);
  }
}
  */
