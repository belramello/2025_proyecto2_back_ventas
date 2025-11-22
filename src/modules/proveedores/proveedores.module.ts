import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedore.entity';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresController } from './proveedores.controller';
import { ProveedorMapper } from './mappers/proveedores.mapper';
import { ProveedoresRepository } from './repository/proveedor.repository';
import { ProveedoresValidator } from './helpers/proveedor-validator';
import { JwtModule } from '../jwt/jwt.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor]), JwtModule, UsuarioModule],
  controllers: [ProveedoresController],
  providers: [
    ProveedoresService,
    ProveedorMapper,
    ProveedoresRepository,
    ProveedoresValidator,
    {
      provide: 'IProveedoresRepository',
      useExisting: ProveedoresRepository,
    },
  ],
  exports: [ProveedoresService, ProveedorMapper, ProveedoresValidator],
})
export class ProveedoresModule {}
