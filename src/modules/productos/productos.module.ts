import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { DetalleProveedorProducto } from '../detalleproveedorproducto/entities/detalleproveedorproducto.entity';
import { Proveedore } from '../proveedores/entities/proveedore.entity';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { ProductosRepository } from './repository/producto.repository';
import { ProductoMapper } from './mapper/producto.mapper';
import { ProductosValidator } from './helpers/productos-validator';
import { JwtModule } from '../jwt/jwt.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { ProveedoresModule } from '../proveedores/proveedores.module';
import { DetalleProveedorProductoModule } from '../detalleproveedorproducto/detalleproveedorproducto.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, DetalleProveedorProducto, Proveedore]),
    JwtModule,
    UsuarioModule,
    ProveedoresModule,
    forwardRef(() => DetalleProveedorProductoModule), // Usamos forwardRef para evitar circular dependency
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
