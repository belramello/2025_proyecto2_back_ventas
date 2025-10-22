import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import type { IMarcaRepository } from './repositories/marca-repository.interface';
import { Marca } from './entities/marca.entity';

@Injectable()
export class MarcasService {
  constructor(
    @Inject('IMarcaRepository')
    private readonly marcaRepository: IMarcaRepository,
  ) {}

  async create(createMarcaDto: CreateMarcaDto, logoPath?: string): Promise<Marca> {
    const marcaData = { ...createMarcaDto, logo: logoPath };
    return this.marcaRepository.create(marcaData);
  }

  async findAll(): Promise<Marca[]> {
    return this.marcaRepository.findAll();
  }

  async findOne(id: number): Promise<Marca> {
    const _marca = await this.marcaRepository.findOne(id);
    if (!_marca) throw new BadRequestException('Marca no encontrada');
    return _marca;
  }

  async update(id: number, updateMarcaDto: UpdateMarcaDto, logoPath?: string): Promise<Marca> {
    const _marca = await this.findOne(id);
    if (updateMarcaDto.nombre && updateMarcaDto.nombre !== _marca.nombre) {
      const existing = await this.marcaRepository.findByNombre(updateMarcaDto.nombre);
      if (existing) throw new BadRequestException('Nombre ya registrado');
    }
    if (logoPath) updateMarcaDto['logo'] = logoPath;
    await this.marcaRepository.update(id, updateMarcaDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const _marca = await this.findOne(id);
    // TODO: Chequeo de productos asociados cuando lineas esté listo
    await this.marcaRepository.remove(id);
  }

  async restore(id: number): Promise<void> {
    const _marca = await this.marcaRepository.findOne(id);
    if (!_marca?.deletedAt) throw new BadRequestException('La marca no se encuentra eliminada');
    await this.marcaRepository.restore(id);
  }
}