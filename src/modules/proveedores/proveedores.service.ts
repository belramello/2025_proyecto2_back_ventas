import { Injectable, Inject } from '@nestjs/common';
import { CreateProveedoreDto } from './dto/create-proveedore.dto';
import type { IProveedoresRepository } from './repository/proveedor-interface.repository';
import { ProveedorMapper } from './mappers/proveedores.mapper';
import { RespuestaFindOneProveedorDto } from './dto/respuesta-find-one-proveedor.dto';
import { PaginationProveedoresDto } from './dto/pagination.dto';
import { RespuestaFindAllPaginatedProveedorDTO } from './dto/respuesta-find-all-paginated.dto';
import { DeleteProveedoreDto } from './dto/delete-proveedore.dto';
import { Proveedor } from './entities/proveedore.entity';

@Injectable()
export class ProveedoresService {
  constructor(
    @Inject('IProveedoresRepository')
    private readonly proveedoresRepository: IProveedoresRepository,
    private readonly proveedorMapper: ProveedorMapper,
    //private readonly validator: ProductosValidator,
  ) {}

  create(createProveedoreDto: CreateProveedoreDto) {
    return this.proveedoresRepository.create(createProveedoreDto);
  }

  async findAll(): Promise<RespuestaFindOneProveedorDto[]> {
    return this.proveedorMapper.toRespuestaFindAllProveedoresDTO(
      await this.proveedoresRepository.findAll(),
    );
  }

  async findOne(id: number): Promise<Proveedor | null> {
    return this.proveedoresRepository.findOne({ id });
  }

  async findByNombre(nombre: string) {
    return await this.proveedoresRepository.findByNombre(nombre);
  }

  async findAllPaginated(
    paginationDto: PaginationProveedoresDto,
  ): Promise<RespuestaFindAllPaginatedProveedorDTO> {
    const { limit = 10, page = 1 } = paginationDto;
    return this.proveedorMapper.toRespuestaFindAllPaginatedProveedorDTO(
      await this.proveedoresRepository.findAllPaginated(page, limit),
    );
  }

  async remove(deleteProveedorDto: DeleteProveedoreDto) {
    return this.proveedoresRepository.remove(deleteProveedorDto);
  }
}
