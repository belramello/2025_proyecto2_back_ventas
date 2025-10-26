import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarcasService } from './marcas.service';
import { MarcasController } from './marcas.controller';
import { Marca } from './entities/marca.entity';
import { MarcaRepository } from './repositories/marca-repository';
import { UsuarioModule } from '../usuario/usuario.module';
import { JwtModule } from '../jwt/jwt.module';
import { HistorialActividadesModule } from '../historial-actividades/historial-actividades.module';
import { MarcaMapper } from './mapper/marca.mapper';
import { MarcaValidator } from './helpers/marcas-validator';
import { LineasModule } from '../lineas/lineas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Marca]),
    UsuarioModule,
    JwtModule,
    HistorialActividadesModule,
    forwardRef(() => LineasModule),
  ],
  controllers: [MarcasController],
  providers: [
    MarcasService,
    MarcaMapper,
    {
      provide: 'IMarcaRepository',
      useClass: MarcaRepository,
    },
    MarcaValidator,
  ],
  exports: [MarcasService, MarcaMapper, MarcaValidator],
})
export class MarcasModule {}
