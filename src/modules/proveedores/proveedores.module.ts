import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedore.entity';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresController } from './proveedores.controller';
import { ProveedorMapper } from './mappers/proveedores.mapper';
import { ProveedoresRepository } from './repository/proveedor.repository';
import { ProveedoresValidator } from './helpers/proveedor-validator';

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor])],
  controllers: [ProveedoresController],
  providers: [
    ProveedoresService,
    ProveedorMapper,
    ProveedoresRepository, // ← necesario para que el validator lo reciba
    ProveedoresValidator,
    {
      provide: 'IProveedoresRepository',
      useExisting: ProveedoresRepository, // ← correcto si usás la interfaz
    },
  ],
  exports: [
    ProveedoresService,
    ProveedorMapper,
    ProveedoresValidator,
  ],
})
export class ProveedoresModule {}
