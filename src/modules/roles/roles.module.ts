import { forwardRef, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity';
import { RolesRepository } from './repositories/roles-repository';
import { RolesValidator } from './helpers/roles-validator';
import { RolesMapper } from './mappers/roles-mapper';
import { JwtModule } from '../jwt/jwt.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { PermisosModule } from '../permisos/permisos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rol]),
    JwtModule,
    forwardRef(() => PermisosModule),
    forwardRef(() => UsuarioModule),
  ],
  controllers: [RolesController],
  providers: [
    RolesService,
    {
      provide: 'IRolesRepository',
      useClass: RolesRepository,
    },
    RolesValidator,
    RolesMapper,
  ],
  exports: [RolesService, RolesMapper, RolesValidator],
})
export class RolesModule {}
