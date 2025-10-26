import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { DetalleProveedorProducto } from '../detalleproveedorproducto/entities/detalleproveedorproducto.entity';
import { Proveedor } from '../proveedores/entities/proveedore.entity';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { ProductosRepository } from './repository/producto.repository';
import { ProductoMapper } from './mapper/producto.mapper';
import { ProductosValidator } from './helpers/productos-validator';
import { JwtModule } from '../jwt/jwt.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { ProveedoresModule } from '../proveedores/proveedores.module';
import { DetalleProveedorProductoModule } from '../detalleproveedorproducto/detalleproveedorproducto.module';
import { MarcasModule } from '../marcas/marcas.module';
import { LineasModule } from '../lineas/lineas.module';
import { HistorialActividadesModule } from '../historial-actividades/historial-actividades.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, DetalleProveedorProducto, Proveedor]),
    JwtModule,
    UsuarioModule,
    ProveedoresModule,
    forwardRef(() => DetalleProveedorProductoModule),
    MarcasModule,
    LineasModule,
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
