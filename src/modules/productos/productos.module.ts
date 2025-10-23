import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosRepository } from './repository/producto.repository';
import { JwtModule } from '../jwt/jwt.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { ProductosValidator } from './helpers/productos-validator';
import { ProductoMapper } from './mapper/producto.mapper';
import { HistorialActividadesModule } from '../historial-actividades/historial-actividades.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto]),
    JwtModule,
    UsuarioModule,
    HistorialActividadesModule,
  ],
  controllers: [ProductosController],
  providers: [
    ProductosService,
    {
      provide: 'IProductosRepository',
      useClass: ProductosRepository,
    },
    ProductosValidator,
    ProductoMapper,
  ],
  exports: [ProductosService],
})
export class ProductosModule {}
