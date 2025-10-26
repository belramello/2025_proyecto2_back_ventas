import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Linea } from './entities/linea.entity';
import { LineasService } from './lineas.service';
import { LineasController } from './lineas.controller';
import { LineaMapper } from './mapper/linea.mapper';
import { LineaRepository } from './repositories/lineas-repository';
import { MarcasModule } from '../marcas/marcas.module';
import { LineasValidator } from './helpers/lineas-validator';

@Module({
  imports: [TypeOrmModule.forFeature([Linea]), forwardRef(() => MarcasModule)],
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
