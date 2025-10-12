import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '../jwt/jwt.service';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [JwtModule, UsuarioModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtService],
})
export class AuthModule {}
