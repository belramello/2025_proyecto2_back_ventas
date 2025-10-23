import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedore.entity';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresController } from './proveedores.controller';
import { ProveedorMapper } from './mappers/proveedores.mapper';
import { ProveedoresRepository } from './repository/proveedor.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor])],
  controllers: [ProveedoresController],
  providers: [
    ProveedoresService,
    ProveedorMapper,
    {
      provide: 'IProveedoresRepository',
      useClass: ProveedoresRepository,
    },
  ],
  exports: [
    ProveedoresService,
    ProveedorMapper, // exportar el mapper para que otros módulos lo puedan usar
  ],
})
export class ProveedoresModule {}
