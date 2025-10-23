import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IDetalleProveedorProductoRepository } from './repositories/detalle-proveedorproducto-repository.interface';
import { ProductosService } from '../productos/productos.service';
import { ProveedoresService } from '../proveedores/proveedores.service';
import { RespuestaFindOneDetalleProveedorProductoDto } from './dto/respuesta-find-one-detalleproveedorproducto.dto';
import { DetalleProveedorProductoMapper } from './mapper/detalle-proveedor-producto.mapper';
import { CreateDetalleProveedorProductoServiceDto } from './dto/create-detalle-proveedor-service.dto';
import { CreateDetalleProveedorRepositoryDto } from './dto/create-detalle-proveedor-repository.dto';

@Injectable()
export class DetalleProveedorProductoService {
  constructor(
    @Inject('IDetalleProveedorProductoRepository')
    private readonly detalleRepository: IDetalleProveedorProductoRepository,
    @Inject(forwardRef(() => ProductosService))
    private readonly productosService: ProductosService,
    private readonly proveedoresService: ProveedoresService,
    private readonly detalleMapper: DetalleProveedorProductoMapper,
  ) {}

  async createDetalles(
    detallesDto: CreateDetalleProveedorProductoServiceDto[],
  ): Promise<RespuestaFindOneDetalleProveedorProductoDto[]> {
    const resultados: RespuestaFindOneDetalleProveedorProductoDto[] = [];
    //Agregar en un validador para verificar existencia de los proveedores.
    for (const dto of detallesDto) {
      resultados.push(await this.create(dto));
    }

    return resultados;
  }

  async create(
    createDetalleDto: CreateDetalleProveedorProductoServiceDto,
  ): Promise<RespuestaFindOneDetalleProveedorProductoDto> {
    const producto = await this.productosService.findOne(
      createDetalleDto.producto.id,
    );
    if (!producto) {
      throw new NotFoundException(
        `No se encontró el producto con ID ${createDetalleDto.producto.id}`,
      );
    }
    const proveedor = await this.proveedoresService.findOne(
      createDetalleDto.proveedorId,
    );
    if (!proveedor) {
      throw new NotFoundException(
        `No se encontró el proveedor con ID ${createDetalleDto.proveedorId}`,
      );
    }
    const detalle: CreateDetalleProveedorRepositoryDto = {
      codigo: createDetalleDto.codigo,
      producto,
      proveedor,
    };
    const detalleGuardado = await this.detalleRepository.create(detalle);
    return this.detalleMapper.toResponseDto(detalleGuardado);
  }

  async findOne(
    id: number,
  ): Promise<RespuestaFindOneDetalleProveedorProductoDto> {
    const detalle = await this.detalleRepository.findOne(id);
    if (!detalle) {
      throw new NotFoundException(`No se encontró el detalle con ID ${id}`);
    }
    return this.detalleMapper.toResponseDto(detalle);
  }
}
