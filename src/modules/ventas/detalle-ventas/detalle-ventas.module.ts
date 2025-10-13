import { Module } from '@nestjs/common';
import { DetalleVentasService } from './detalle-ventas.service';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleVentasRepository } from './repositories/detalle-ventas-repository';
import { ProductosModule } from 'src/modules/productos/productos.module';
import { DetalleVentasValidator } from './helpers/detalle-venta.validator';
import { DetalleVentaMapper } from './mappers/detalle-venta.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleVenta]), ProductosModule],
  providers: [
    DetalleVentasService,
    {
      provide: 'IDetalleVentasRepository',
      useClass: DetalleVentasRepository,
    },
    DetalleVentasValidator,
    DetalleVentaMapper,
  ],
  exports: [DetalleVentasService, DetalleVentaMapper],
})
export class DetalleVentasModule {}
