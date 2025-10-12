import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosRepository } from './repository/producto.repository';
import { ProductosValidator } from './helpers/productos-validator';

@Module({
  imports: [TypeOrmModule.forFeature([Producto])],
  controllers: [ProductosController],
  providers: [
    ProductosService,
    {
      provide: 'IProductosRepository',
      useClass: ProductosRepository,
    },
    ProductosValidator,
  ],
  exports: [ProductosService],
})
export class ProductosModule {}
