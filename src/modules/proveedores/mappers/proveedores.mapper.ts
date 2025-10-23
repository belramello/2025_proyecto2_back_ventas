import { Injectable } from '@nestjs/common';
import { Proveedor } from '../entities/proveedore.entity';
import { RespuestaCreateProveedorDto } from '../dto/respuesta-create-proveedor.dto';
import { RespuestaFindOneProveedorDto } from '../dto/respuesta-find-one-proveedor.dto';
import { RespuestaFindAllPaginatedProveedorDTO } from '../dto/respuesta-find-all-paginated.dto';

@Injectable()
export class ProveedorMapper {
  toRespuestaCreateProveedor(
    proveedor: Proveedor,
  ): RespuestaCreateProveedorDto {
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

  toRespuestaFindOneProveedor(
    proveedor: Proveedor,
  ): RespuestaFindOneProveedorDto {
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

  toRespuestaFindAllProveedoresDTO(
    proveedores: Proveedor[],
  ): RespuestaFindOneProveedorDto[] {
    return proveedores.map((proveedor) =>
      this.toRespuestaFindOneProveedor(proveedor),
    );
  }

  toRespuestaFindAllPaginatedProveedorDTO(paginated: {
    proveedores: Proveedor[];
    total: number;
    page: number;
    lastPage: number;
  }): RespuestaFindAllPaginatedProveedorDTO {
    return {
      proveedores: this.toRespuestaFindAllProveedoresDTO(paginated.proveedores),
      total: paginated.total,
      page: paginated.page,
      lastPage: paginated.lastPage,
    };
  }
}
