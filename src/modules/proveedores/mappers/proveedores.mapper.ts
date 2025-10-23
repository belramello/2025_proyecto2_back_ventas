import { Injectable } from '@nestjs/common';
import { Proveedore } from '../entities/proveedore.entity';
import { RespuestaCreateProveedorDto } from '../dto/respuesta-create-proveedor.dto';
import { RespuestaFindOneProveedorDto } from '../dto/respuesta-find-one-proveedor.dto';
import { RespuestaFindAllPaginatedProductoDTO } from '../dto/respuesta-find-all-paginated.dto';

@Injectable()
export class ProveedorMapper {


  toRespuestaCreateProveedor(proveedor: Proveedore): RespuestaCreateProveedorDto {
    return {
      id: proveedor.id,
      nombre: proveedor.nombre,
      direccion: proveedor.direccion,
      email: proveedor.email,
      contacto: proveedor.contacto,
      provincia: proveedor.provincia,
      localidad: proveedor.localidad,
    
    };
  }


  toRespuestaFindOneProveedor(proveedor: Proveedore): RespuestaFindOneProveedorDto {
    return {
      id: proveedor.id,
      nombre: proveedor.nombre,
      direccion: proveedor.direccion,
      email: proveedor.email,
      contacto: proveedor.contacto,
      provincia: proveedor.provincia,
      localidad: proveedor.localidad,
    };
  }


  toRespuestaFindAllProveedoresDTO(proveedores: Proveedore[]): RespuestaFindOneProveedorDto[] {
    return proveedores.map((proveedor) => this.toRespuestaFindOneProveedor(proveedor));
  }


  toRespuestaFindAllPaginatedProveedorDTO(paginated: {
    proveedores: Proveedore[];
    total: number;
    page: number;
    lastPage: number;
  }): RespuestaFindAllPaginatedProductoDTO {
    return {
      proveedores: this.toRespuestaFindAllProveedoresDTO(paginated.proveedores),
      total: paginated.total,
      page: paginated.page,
      lastPage: paginated.lastPage,
    };
  }
}
