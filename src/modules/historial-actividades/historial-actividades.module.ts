import { Module } from '@nestjs/common';
import { HistorialActividadesService } from './historial-actividades.service';
import { HistorialActividadesController } from './historial-actividades.controller';
import { HistorialActividades } from './entities/historial-actividade.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialActividadesRepository } from './repository/historial-actividades.repository';
import { HistorialActividadesMapper } from './mappers/historial.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialActividades])],
  controllers: [HistorialActividadesController],
  providers: [
    HistorialActividadesService,
    {
      provide: 'IHistorialActividadesRepository',
      useClass: HistorialActividadesRepository,
    },
    HistorialActividadesMapper,
  ],
})
export class HistorialActividadesModule {}
