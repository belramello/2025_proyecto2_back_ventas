import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarcasService } from './marcas.service';
import { MarcasController } from './marcas.controller';
import { Marca } from './entities/marca.entity';
import { MarcaRepository } from './repositories/marca-repository';
import { MarcaNombreUniqueValidator } from './helpers/marcas-validator';
import { UsuarioModule } from '../usuario/usuario.module';
import { JwtModule } from '../jwt/jwt.module';
import { HistorialActividadesModule } from '../historial-actividades/historial-actividades.module';

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
    {
      provide: 'IMarcaRepository',
      useClass: MarcaRepository,
    },
    MarcaNombreUniqueValidator,
  ],
  exports: [MarcasService],
})
export class MarcasModule {}
