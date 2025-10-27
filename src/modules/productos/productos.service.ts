/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { DeleteProductoDto } from './dto/delete-producto.dto';
import type { IProductosRepository } from './repository/producto-repository.interface';
import { PaginationProductoDto } from './dto/pagination.dto';
import { RespuestaFindAllPaginatedProductoDTO } from './dto/respuesta-find-all-paginated.dto';
import { ProductoMapper } from './mapper/producto.mapper';
import { Producto } from './entities/producto.entity';
import { ProductosValidator } from './helpers/productos-validator';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';
import { Usuario } from '../usuario/entities/usuario.entity';
import type { Express } from 'express';
import * as fs from 'fs';
import { RespuestaFindOneDetalleProductoDto } from './dto/respuesta-find-one-detalleproducto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @Inject('IProductosRepository')
    private readonly productosRepository: IProductosRepository,
    private readonly productoMapper: ProductoMapper,
    private readonly validator: ProductosValidator,
    private readonly historialActividades: HistorialActividadesService,
  ) {}

  async create(
    createProductoDto: CreateProductoDto,
    usuario: Usuario,
    file?: Express.Multer.File,
  ) {
    const imagePath = file ? file.path.replace(/\\/g, '/') : null;

    try {
      // 1. Validaciones
      await this.validator.validateProductoConCodigo(createProductoDto.codigo);
      const marca = await this.validator.validateMarcaExistente(
        createProductoDto.marcaId,
      );
      const linea = await this.validator.validateLineaExistente(
        createProductoDto.lineaId,
      );
      await this.validator.validateLineaParaMarca(linea, marca);

      // 2. Crear DTO para la BD
      const productoParaCrear = {
        ...createProductoDto,
        fotoUrl: imagePath,
      };

      // 3. Guardar
      const productoCreado = await this.productosRepository.create(
        productoParaCrear,
        usuario,
        marca,
        linea,
      );

      // 4. Registrar historial
      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 7,
        estadoId: 1,
      });

      return productoCreado;
    } catch (error) {
      // 5. Revertir imagen si falla
      if (file) {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          // No hacer nada si falla el borrado
        }
      }

      // 6. Registrar historial de error
      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 7,
        estadoId: 2, // Estado Fallido
      });

      // 7. Relanzar el error
      throw error;
    }
  }

  async findAllPaginated(
    paginationDto: PaginationProductoDto,
  ): Promise<RespuestaFindAllPaginatedProductoDTO> {
    const { limit = 10, page = 1 } = paginationDto;
    return this.productoMapper.toRespuestaFindAllPaginatedProductoDTO(
      await this.productosRepository.findAllPaginated(page, limit),
    );
  }

  async findOne(id: number): Promise<Producto | null> {
    return this.productosRepository.findOne(id);
  }

  async findOneByCodigo(codigo: string): Promise<Producto | null> {
    return await this.productosRepository.findByCodigo(codigo);
  }
  async findOneByDetalle(id: number): Promise<RespuestaFindOneDetalleProductoDto | null> {
    return this.productosRepository.findOneByDetalle(id);
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
    usuario: Usuario,
    file?: Express.Multer.File,
  ) {
    try {
      const datosActualizados: any = { ...updateProductoDto };

      if (file) {
        datosActualizados.fotoUrl = file.path.replace(/\\/g, '/');
        // (Opcional: aquí deberías borrar la imagen antigua del disco)
      }

      // (Asegúrate de que tu UpdateProductoDto también use @Type() para los números)
      const producto = this.productosRepository.update(
        id,
        datosActualizados as UpdateProductoDto,
        usuario,
      );

      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 8,
        estadoId: 1,
      });
      return producto;
    } catch (error) {
      if (file) {
        try {
          fs.unlinkSync(file.path);
        } catch (e) {
          /* empty */
        }
      }

      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 8,
        estadoId: 2,
      });
      throw error;
    }
  }

  async decrementarStock(producto: Producto, cantidad: number): Promise<void> {
    this.validator.validateStock(producto, cantidad);
    await this.productosRepository.decrementStock(producto.id, cantidad);
  }

  async remove(deleteProductoDto: DeleteProductoDto): Promise<any> {
    try {
      const producto = await this.productosRepository.remove(deleteProductoDto);
      // (Opcional: borrar el archivo de imagen del disco)
      await this.historialActividades.create({
        usuario: deleteProductoDto.usuarioId as unknown as number,
        accionId: 9,
        estadoId: 1,
      });
      return producto;
    } catch (error) {
      await this.historialActividades.create({
        usuario: deleteProductoDto.usuarioId as unknown as number,
        accionId: 9,
        estadoId: 2,
      });
      throw error;
    }
  }
}
