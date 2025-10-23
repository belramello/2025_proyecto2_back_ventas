import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proveedore } from './entities/proveedore.entity';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresController } from './proveedores.controller';
import { ProveedorMapper } from './mappers/proveedores.mapper';
@Module({
  imports: [
    TypeOrmModule.forFeature([Proveedore]), // entidad necesaria
  ],
  controllers: [ProveedoresController],
  providers: [ProveedoresService, ProveedorMapper],
  exports: [ProveedoresService], // si otros módulos lo necesitan
})
export class ProveedoresModule {}
