import { forwardRef, Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { UsuariosMappers } from './mappers/usuarios.mappers';
import { UsuarioRepository } from './repositories/usuarios-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { AuthModule } from '../auth/auth.module';
import { UsuariosValidator } from './helpers/usuarios-validator';
import { RolesModule } from '../roles/roles.module';
import { JwtModule } from '../jwt/jwt.module';
import { UsuarioUpdater } from './helpers/usuario-updater';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    AuthModule,
    forwardRef(() => RolesModule),
    JwtModule,
  ],
  controllers: [UsuarioController],
  providers: [
    UsuarioService,
    UsuariosMappers,
    {
      provide: 'IUsuarioRepository',
      useClass: UsuarioRepository,
    },
    UsuariosValidator,
    UsuarioUpdater,
  ],
  exports: [UsuarioService],
})
export class UsuarioModule {}
