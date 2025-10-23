import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDetalleProveedorProductoDto } from './dto/create-detalleproveedorproducto.dto';
import { DetalleProveedorProducto } from './entities/detalleproveedorproducto.entity';
import type { IDetalleProveedorProductoRepository } from './repositories/detalle-proveedorproducto-repository.interface';
import { ProductosService } from '../productos/productos.service';
import { ProveedoresService } from '../proveedores/proveedores.service';
import { RespuestaFindOneDetalleProveedorProductoDto } from './dto/respuesta-find-one-detalleproveedorproducto.dto';
import { DetalleProveedorProductoMapper } from './mapper/detalle-proveedor-producto.mapper';

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
    detallesDto: CreateDetalleProveedorProductoDto[],
  ): Promise<RespuestaFindOneDetalleProveedorProductoDto[]> {
    const resultados: RespuestaFindOneDetalleProveedorProductoDto[] = [];

    for (const dto of detallesDto) {
      const producto = await this.productosService.findOne(dto.producto.id);
      if (!producto) {
        throw new NotFoundException(
          `No se encontró el producto con ID ${dto.producto.id}`,
        );
      }

      const proveedor = await this.proveedoresService.findOne(dto.proveedor.id);
      if (!proveedor) {
        throw new NotFoundException(
          `No se encontró el proveedor con ID ${dto.proveedor.id}`,
        );
      }

      const detalle: DetalleProveedorProducto = {
        id: 0,
        codigo: dto.codigo,
        producto,
        proveedor,
      };

      const detalleGuardado = await this.detalleRepository.create(detalle);
      resultados.push(this.detalleMapper.toResponseDto(detalleGuardado));
    }

    return resultados;
  }

  async create(
    createDetalleDto: CreateDetalleProveedorProductoDto,
  ): Promise<RespuestaFindOneDetalleProveedorProductoDto> {
    const producto = await this.productosService.findOne(createDetalleDto.producto.id);
    if (!producto) {
      throw new NotFoundException(
        `No se encontró el producto con ID ${createDetalleDto.producto.id}`,
      );
    }

    const proveedor = await this.proveedoresService.findOne(createDetalleDto.proveedor.id);
    if (!proveedor) {
      throw new NotFoundException(
        `No se encontró el proveedor con ID ${createDetalleDto.proveedor.id}`,
      );
    }

    const detalle: DetalleProveedorProducto = {
      id: 0,
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
