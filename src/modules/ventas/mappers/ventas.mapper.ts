import { Injectable } from '@nestjs/common';
import { RespuestaCreateVentaDto } from '../dto/respuesta-create-venta.dto';
import { Venta } from '../entities/venta.entity';
import { RespuestaFindOneVentaDto } from '../dto/respuesta-find-one-venta.dto';
import { RespuestaFindOneDetalleVentaDto } from '../detalle-ventas/dto/respuesta-find-one-detalle-venta.dto';
import { DetalleVentaMapper } from '../detalle-ventas/mappers/detalle-venta.mapper';
import { RespuestaFindAllPaginatedVentaDTO } from '../dto/respuesta-find-all-paginated-venta.dto';

@Injectable()
export class VentasMapper {
  constructor(private readonly detalleVentaMapper: DetalleVentaMapper) {}
  toRespuestaCreateVentaDto(venta: Venta): RespuestaCreateVentaDto {
    return {
      id: venta.id,
      total: venta.total,
      medioDePago: venta.medioDePago,
      vendedor: venta.vendedor.nombre + ' ' + venta.vendedor.apellido,
      fecha: venta.fechaCreacion,
    };
  }

  toRespuestaFinalFindOneDto(venta: Venta): RespuestaFindOneVentaDto {
    const detalles: RespuestaFindOneDetalleVentaDto[] = venta.detalleVentas.map(
      (detalle) => this.detalleVentaMapper.toResponseDto(detalle),
    );
    const respuesta: RespuestaFindOneVentaDto = {
      id: venta.id,
      total: venta.total,
      medioDePago: venta.medioDePago,
      detalles,
      vendedor: venta.vendedor.nombre + ' ' + venta.vendedor.apellido,
      fecha: venta.fechaCreacion,
    };

    return respuesta;
  }

  toRespuestaFindAllVentaDTO(ventas: Venta[]): RespuestaFindOneVentaDto[] {
    return ventas.map((venta) => this.toRespuestaFinalFindOneDto(venta));
  }

  toRespuestaFindAllPaginatedVentaDTO(paginated: {
    ventas: Venta[];
    total: number;
    page: number;
    lastPage: number;
  }): RespuestaFindAllPaginatedVentaDTO {
    return {
      ventas: this.toRespuestaFindAllVentaDTO(paginated.ventas),
      total: paginated.total,
      page: paginated.page,
      lastPage: paginated.lastPage,
    };
  }
}
