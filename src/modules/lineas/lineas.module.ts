import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Linea } from './entities/linea.entity';
import { LineasService } from './lineas.service';
import { LineasController } from './lineas.controller';
import { LineaMapper } from './mapper/linea.mapper';
import { LineaRepository } from './repositories/lineas-repository';
import { MarcasModule } from '../marcas/marcas.module';
import { LineasValidator } from './helpers/lineas-validator';
import { HistorialActividadesModule } from '../historial-actividades/historial-actividades.module';
import { JwtModule } from '../jwt/jwt.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Linea]),
    forwardRef(() => MarcasModule),
    HistorialActividadesModule,
    JwtModule,
    UsuarioModule,
  ],
  controllers: [LineasController],
  providers: [
    LineasService,
    LineaMapper,
    {
      provide: 'ILineaRepository',
      useClass: LineaRepository,
    },
    LineasValidator,
  ],
  exports: [LineasService, LineaMapper, TypeOrmModule, LineasValidator],
})
export class LineasModule {}
