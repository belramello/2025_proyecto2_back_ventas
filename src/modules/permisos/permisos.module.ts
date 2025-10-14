import { forwardRef, Module } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { Permiso } from './entities/permiso.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermisosRepository } from './repositories/permisos-repository';
import { JwtModule } from '../jwt/jwt.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permiso]),
    forwardRef(() => UsuarioModule),
    JwtModule,
  ],
  controllers: [PermisosController],
  providers: [
    PermisosService,
    {
      provide: 'IPermisosRepository',
      useClass: PermisosRepository,
    },
  ],
  exports: [PermisosService],
})
export class PermisosModule {}
