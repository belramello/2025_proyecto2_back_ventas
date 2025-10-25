import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarcasService } from './marcas.service';
import { MarcasController } from './marcas.controller';
import { Marca } from './entities/marca.entity';
import { MarcaRepository } from './repositories/marca-repository';
import { MarcaNombreUniqueValidator } from './helpers/marcas-validator';
<<<<<<< HEAD
import { UsuarioModule } from '../usuario/usuario.module';
import { JwtModule } from '../jwt/jwt.module';
import { HistorialActividadesModule } from '../historial-actividades/historial-actividades.module';
=======
import { MarcaMapper } from './mapper/marca.mapper';
>>>>>>> 3fc5bb476e60d911280b1b36f7f12920d2e214ef

@Module({
  imports: [
    TypeOrmModule.forFeature([Marca]),
    UsuarioModule,
    JwtModule,
    HistorialActividadesModule,
  ],
  controllers: [MarcasController],
  providers: [
    MarcasService,
    MarcaMapper,
    {
      provide: 'IMarcaRepository',
      useClass: MarcaRepository,
    },
    MarcaNombreUniqueValidator,
  ],
  exports: [MarcasService],
})
export class MarcasModule {}
