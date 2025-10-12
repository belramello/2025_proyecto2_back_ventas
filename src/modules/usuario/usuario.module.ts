import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { UsuariosMappers } from './mappers/usuarios.mappers';
import { UsuarioRepositorySQL } from './repositories/sql.repository';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuarioController],
  providers: [
    UsuarioService,
    UsuarioRepositorySQL,
    UsuariosMappers,
    ConfigService,
  ],
  exports: [UsuarioRepositorySQL, UsuarioService],
})
export class UsuarioModule {}
