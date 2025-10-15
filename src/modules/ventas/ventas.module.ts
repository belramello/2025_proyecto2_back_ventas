import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { VentasRepository } from './repositories/ventas-repository';
import { DetalleVentasModule } from './detalle-ventas/detalle-ventas.module';
import { VentasMapper } from './mappers/ventas.mapper';
import { JwtModule } from '../jwt/jwt.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta]),
    DetalleVentasModule,
    JwtModule,
    UsuarioModule,
  ],
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
