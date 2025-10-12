import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosRepository } from './repository/producto.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Producto])],
  controllers: [ProductosController],
  providers: [ProductosService,
     {
      provide: 'IProductosRepository',
      useClass: ProductosRepository,
    },
  ],
})
export class ProductosModule {}
