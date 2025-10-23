import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuarioModule } from '../usuario/usuario.module';
import { JwtModule } from '../jwt/jwt.module';
import { AuthMapper } from './mappers/auth-mapper';
import { AuthValidator } from './helpers/auth-validator';
import { HistorialActividadesModule } from '../historial-actividades/historial-actividades.module';

@Module({
  imports: [
    JwtModule,
    forwardRef(() => UsuarioModule),
    HistorialActividadesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthMapper, AuthValidator],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
