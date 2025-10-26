/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
import * as fs from 'fs';

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
      await this.validator.validateProductoConCodigo(createProductoDto.codigo);
      const marca = await this.validator.validateMarcaExistente(
        createProductoDto.marcaId,
      );
      const linea = await this.validator.validateLineaExistente(
        createProductoDto.lineaId,
      );
      await this.validator.validateLineaParaMarca(linea, marca);

      const productoParaCrear = {
        ...createProductoDto,
        fotoUrl: imagePath,
      };

      const productoCreado = await this.productosRepository.create(
        productoParaCrear,
        usuario,
        marca,
        linea,
      );

      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 7,
        estadoId: 1,
      });

      return productoCreado;

    } catch (error) {
      // SI ALGO FALLA (Validación o BD), borramos la imagen que se subió.
      if (file) {
        try {
          fs.unlinkSync(file.path);
          console.log(`Imagen revertida: ${file.path} eliminada.`);
        } catch (unlinkError) {
          console.error(`Error al eliminar la imagen ${file.path}:`, unlinkError);
        }
      }
      
      // Registrar historial de error
      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 7,
        estadoId: 2, // Estado Fallido
      });
      
      // Relanzar el error original (probablemente un BadRequestException del validator)
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

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
    usuario: Usuario,
    file?: Express.Multer.File,
  ) {
    try {
      // 1. Crear DTO parcial
      const datosActualizados: any = { ...updateProductoDto };

      // 2. Parsear números si existen
      if (updateProductoDto.precio) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        datosActualizados.precio = parseFloat(updateProductoDto.precio as any);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        if (isNaN(datosActualizados.precio))
          throw new BadRequestException('Precio no válido.');
      }
      if (updateProductoDto.marcaId) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        datosActualizados.marcaId = parseInt(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          updateProductoDto.marcaId as any,
          10,
        );
        if (isNaN(datosActualizados.marcaId))
          throw new BadRequestException('Marca ID no válida.');
      }
      if (updateProductoDto.lineaId) {
        datosActualizados.lineaId = parseInt(
          updateProductoDto.lineaId as any,
          10,
        );
        if (isNaN(datosActualizados.lineaId))
          throw new BadRequestException('Línea ID no válida.');
      }

      // 3. Manejar la imagen si se subió una nueva
      if (file) {
        // Guardar la nueva ruta y normalizar slashes
        datosActualizados.imagen = file.path.replace(/\\/g, '/');
        // (Opcional: aquí deberías borrar la imagen antigua del disco)
      }

      // 4. Llamar al repositorio
      const producto = this.productosRepository.update(
        id,
        datosActualizados as UpdateProductoDto,
        usuario,
      );

      // 5. Registro actualización exitosa
      await this.historialActividades.create({
        usuario: usuario.id,
        accionId: 8,
        estadoId: 1,
      });
      return producto;
    } catch (error) {
      // Registro historial fallido
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
      // (Opcional: aquí deberías borrar el archivo de imagen del disco)
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
