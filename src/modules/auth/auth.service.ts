import { Injectable } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { UsuarioService } from '../usuario/usuario.service';
import { LoginDto } from '../usuario/dto/login.dto';
import { LoginResponseDto } from '../usuario/dto/login-response.dto';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { hashPassword } from './helpers/password-helper';
import { AuthValidator } from './helpers/auth-validator';
import { AuthMapper } from './mappers/auth-mapper';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsuarioService,
    private readonly authValidator: AuthValidator,
    private readonly authMapper: AuthMapper,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const usuario = await this.authValidator.validarEmailExistente(
      loginDto.email,
    );
    await this.authValidator.validarContraseñaCorrecta(
      loginDto.password,
      usuario.password,
    );
    const payload = { email: usuario.email, sub: usuario.id.toString() };
    return this.authMapper.toLoginResponseDto(
      this.jwtService.generateToken(payload, 'auth'),
      this.jwtService.generateToken(payload, 'refresh'),
      usuario,
    );
  }

  async register(createUserDto: CreateUsuarioDto): Promise<LoginResponseDto> {
    await this.authValidator.validarEmailSinUsar(createUserDto.email);
    const hashedPassword = await hashPassword(createUserDto.password);
    const nuevoUsuario = await this.userService.createUsuario({
      ...createUserDto,
      password: hashedPassword,
    });
    const payload = {
      email: nuevoUsuario.email,
      sub: nuevoUsuario.id.toString(),
    };
    const accessToken = this.jwtService.generateToken(payload, 'auth');
    const refreshToken = this.jwtService.generateToken(payload, 'refresh');
    return this.authMapper.toLoginResponseDto(
      accessToken,
      refreshToken,
      nuevoUsuario,
    );
  }

  async refresh(refreshToken: string): Promise<LoginResponseDto> {
    const tokens = this.jwtService.refreshToken(refreshToken);
    const payload = this.jwtService.getPayload(refreshToken, 'refresh') as {
      sub: string;
      email: string;
    };
    const user = await this.authValidator.validarUsuarioExistente(
      parseInt(payload.sub),
    );
    return this.authMapper.toLoginResponseDto(
      tokens.accessToken,
      tokens.refreshToken || refreshToken,
      user,
    );
  }
}
