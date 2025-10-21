import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuarioModule } from '../usuario/usuario.module';
import { JwtModule } from '../jwt/jwt.module';
import { AuthMapper } from './mappers/auth-mapper';
import { AuthValidator } from './helpers/auth-validator';

@Module({
  imports: [JwtModule, forwardRef(() => UsuarioModule)],
  controllers: [AuthController],
  providers: [AuthService, AuthMapper, AuthValidator],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
