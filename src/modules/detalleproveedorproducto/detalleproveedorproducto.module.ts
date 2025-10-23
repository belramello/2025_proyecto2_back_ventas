import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleProveedorProducto } from './entities/detalleproveedorproducto.entity';
import { Proveedore } from '../proveedores/entities/proveedore.entity';
import { DetalleProveedorProductoService } from './detalleproveedorproducto.service';
import { DetalleProveedorProductoRepository } from './repositories/detalle-proveedorproducto-repository';
import { DetalleProveedorProductoMapper } from './mapper/detalle-proveedor-producto.mapper';
import { ProductosModule } from '../productos/productos.module';
import { ProveedoresModule } from '../proveedores/proveedores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetalleProveedorProducto, Proveedore]),
    forwardRef(() => ProductosModule), // forwardRef para evitar circular dependency
    ProveedoresModule,
  ],
  providers: [
    DetalleProveedorProductoService,
    {
      provide: 'IDetalleProveedorProductoRepository',
      useClass: DetalleProveedorProductoRepository,
    },
    DetalleProveedorProductoMapper,
  ],
  exports: [DetalleProveedorProductoService, DetalleProveedorProductoMapper],
})
export class DetalleProveedorProductoModule {}
