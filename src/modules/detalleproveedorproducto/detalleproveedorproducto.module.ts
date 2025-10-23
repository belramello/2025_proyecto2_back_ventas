import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleProveedorProducto } from './entities/detalleproveedorproducto.entity';
import { Proveedore } from '../proveedores/entities/proveedore.entity'; // relación
import { DetalleproveedorproductoService } from './detalleproveedorproducto.service';
import { DetalleproveedorproductoController } from './detalleproveedorproducto.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetalleProveedorProducto, Proveedore]), // entidades necesarias
  ],
  controllers: [DetalleproveedorproductoController],
  providers: [DetalleproveedorproductoService],
  exports: [DetalleproveedorproductoService], // si otros módulos lo necesitan
})
export class DetalleproveedorproductoModule {}
