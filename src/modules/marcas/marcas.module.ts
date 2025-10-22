import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarcasService } from './marcas.service';
import { MarcasController } from './marcas.controller';
import { Marca } from './entities/marca.entity';
import { MarcaRepository } from './repositories/marca-repository';
import { IMarcaRepository } from './repositories/marca-repository.interface';
import { JwtModule } from '../jwt/jwt.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { MarcaNombreUniqueValidator } from './helpers/marcas-validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Marca]),
    JwtModule,
    UsuarioModule,
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