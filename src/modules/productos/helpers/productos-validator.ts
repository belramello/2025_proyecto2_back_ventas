import {
  Injectable,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { Producto } from '../entities/producto.entity';
import { ProductosService } from '../productos.service';
import { Marca } from '../../../modules/marcas/entities/marca.entity';
import { MarcaValidator } from '../../../modules/marcas/helpers/marcas-validator';
import { LineasValidator } from '../../../modules/lineas/helpers/lineas-validator';
import { Linea } from '../../../modules/lineas/entities/linea.entity';

@Injectable()
export class ProductosValidator {
  constructor(
    @Inject(forwardRef(() => ProductosService))
    private readonly productosService: ProductosService,
    private readonly marcaValidator: MarcaValidator,
    private readonly lineaValidator: LineasValidator,
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

  async validateMarcaExistente(marcaId: number): Promise<Marca> {
    const marca = await this.marcaValidator.validateExistencia(marcaId);
    return marca;
  }

  async validateLineaExistente(lineaId: number): Promise<Linea> {
    const linea = await this.lineaValidator.validateLineaExistente(lineaId);
    return linea;
  }

  async validateLineaParaMarca(linea: Linea, marca: Marca): Promise<void> {
    await this.lineaValidator.validateLineaVinculadaAMarca(linea, marca);
  }
}
