import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity';
import { PermisosModule } from '../permisos/permisos.module';
import { RolesRepository } from './repositories/roles-repository';
import { RolesValidator } from './helpers/roles-validator';
import { RolesMapper } from './mappers/roles-mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Rol]), PermisosModule],
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
  exports: [RolesService],
})
export class RolesModule {}
