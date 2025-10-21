import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarcasService } from './marcas.service';
import { MarcasController } from './marcas.controller';
import { Marca } from './entities/marca.entity';
import { MarcaRepository } from './repositories/marca-repository';
import { MarcaNombreUniqueValidator } from './helpers/marcas-validator';
import { AuthModule } from '../auth/auth.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([Marca]), AuthModule, UsuarioModule],
  controllers: [MarcasController],
  providers: [MarcasService, MarcaRepository, MarcaNombreUniqueValidator],
})
export class MarcasModule {}
