import { Module } from '@nestjs/common';
import { DetalleVentasService } from './detalle-ventas.service';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleVentasRepository } from './repositories/detalle-ventas-repository';
import { ProductosModule } from 'src/modules/productos/productos.module';
import { DetalleVentasValidator } from './helpers/detalle-venta.validator';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleVenta]), ProductosModule],
  providers: [
    DetalleVentasService,
    {
      provide: 'IDetalleVentasRepository',
      useClass: DetalleVentasRepository,
    },
    DetalleVentasValidator,
  ],
  exports: [DetalleVentasService],
})
export class DetalleVentasModule {}
