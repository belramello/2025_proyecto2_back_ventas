import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { UsuariosMappers } from './mappers/usuarios.mappers';
import { UsuarioRepository } from './repositories/usuarios-repository';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), AuthModule],
  controllers: [UsuarioController],
  providers: [
    UsuarioService,
    UsuariosMappers,
    ConfigService,
    {
      provide: 'IUsuarioRepository',
      useClass: UsuarioRepository,
    },
  ],
  exports: [UsuarioService],
})
export class UsuarioModule {}
