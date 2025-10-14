import { Module } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { Permiso } from './entities/permiso.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermisosRepository } from './repositories/permisos-repository';

@Module({
  imports: [TypeOrmModule.forFeature([Permiso])],
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
