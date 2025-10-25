import {
  Injectable,
  BadRequestException,
  forwardRef,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { Producto } from '../entities/producto.entity';
import { ProductosService } from '../productos.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Marca } from 'src/modules/marcas/entities/marca.entity';
import { Repository } from 'typeorm';
import { Linea } from 'src/modules/lineas/entities/linea.entity';

@Injectable()
export class ProductosValidator {
  constructor(
    @Inject(forwardRef(() => ProductosService))
    private readonly productosService: ProductosService,
   @InjectRepository(Marca)
    private readonly marcaRepository: Repository<Marca>,

    @InjectRepository(Linea)
    private readonly lineaRepository: Repository<Linea>,
  ) {}
  validateStock(producto: Producto, cantidad: number) {
    if (producto.stock < cantidad) {
      throw new BadRequestException(
        `Stock insuficiente para producto ${producto.id}`,
      );
    }
  }


  async validateProductoConCodigo(codigo: string): Promise<void> {
    const producto = await this.productosService.findOneByCodigo(codigo);
    if (producto) {
      throw new BadRequestException(
        `El código ${codigo} ya está en uso por otro producto.`,
      );
    }
  }

   async validateMarcaExistente(marcaId: number): Promise<void> {
    const marca = await this.marcaRepository.findOne({ where: { id: marcaId } });
    if (!marca) {
      throw new NotFoundException(`La marca con ID ${marcaId} no existe`);
    }
  }

  async validateLineaExistente(lineaId: number): Promise<void> {
    const linea = await this.lineaRepository.findOne({ where: { id: lineaId } });
    if (!linea) {
      throw new NotFoundException(`La línea con ID ${lineaId} no existe`);
    }
  }
}
