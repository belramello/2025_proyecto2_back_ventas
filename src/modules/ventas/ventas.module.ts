import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { VentasRepository } from './repositories/ventas-repository';
import { DetalleVentasModule } from './detalle-ventas/detalle-ventas.module';
import { VentasMapper } from './mappers/ventas.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Venta]), DetalleVentasModule],
  controllers: [VentasController],
  providers: [
    VentasService,
    {
      provide: 'IVentasRepository',
      useClass: VentasRepository,
    },
    VentasMapper,
  ],
})
export class VentasModule {}
