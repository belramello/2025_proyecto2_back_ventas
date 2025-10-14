import { Injectable } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { UsuarioService } from '../usuario/usuario.service';
import { LoginDto } from '../usuario/dto/login.dto';
import { LoginResponseDto } from '../usuario/dto/login-response.dto';
import { comparePasswords, hashPassword } from 'src/helpers/password.helper';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { RespuestaUsuarioDto } from '../usuario/dto/respuesta-usuario.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private userService: UsuarioService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new Error('Usuario con email no encontrado');
    }
    const isPasswordValid = await comparePasswords(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new Error('Contraseña incorrecta');
    }

    const payload = { email: user.email, sub: user.id.toString() };

    return {
      accessToken: this.jwtService.generateToken(payload, 'auth'),
      refreshToken: this.jwtService.generateToken(payload, 'refresh'),
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol.nombre,
      },
    };
  }

  async register(createUserDto: CreateUsuarioDto): Promise<LoginResponseDto> {
    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new Error('El email ya está en uso');
    }

    const hashedPassword = await hashPassword(createUserDto.password);
    const newUser = await this.userService.createUsuario({
      ...createUserDto,
      password: hashedPassword,
    });

    const payload = { email: newUser.email, sub: newUser.id.toString() };

    return {
      accessToken: this.jwtService.generateToken(payload, 'auth'),
      refreshToken: this.jwtService.generateToken(payload, 'refresh'),
      usuario: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
      },
    };
  }

  async refresh(refreshToken: string): Promise<LoginResponseDto> {
    const tokens = this.jwtService.refreshToken(refreshToken);
    const payload = this.jwtService.getPayload(refreshToken, 'refresh') as {
      sub: string;
      email: string;
    };
    const user = await this.validateUser(parseInt(payload.sub));
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || refreshToken,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    };
  }

  private async validateUser(id: number): Promise<RespuestaUsuarioDto> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }
}
