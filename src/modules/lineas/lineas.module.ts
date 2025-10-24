import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Linea } from './entities/linea.entity';
import { LineasService } from './lineas.service';
import { LineasController } from './lineas.controller';
import { LineaMapper } from './mapper/linea.mapper';
import { LineaRepository } from './repositories/lineas-repository';
import { MarcasModule } from '../marcas/marcas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Linea]), MarcasModule],
  controllers: [LineasController],
  providers: [
    LineasService,
    LineaMapper,
    {
      provide: 'ILineaRepository',
      useClass: LineaRepository,
    },
  ],
  exports: [
    LineasService,
    LineaMapper,
  ],
})
export class LineasModule {}
