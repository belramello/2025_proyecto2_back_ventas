import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from '../usuario/dto/login.dto';
import { LoginResponseDto } from '../usuario/dto/login-response.dto';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario autenticado correctamente.',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado correctamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos de registro inválidos.' })
  @ApiBody({ type: CreateUsuarioDto })
  async register(
    @Body() createUsuarioDto: CreateUsuarioDto,
  ): Promise<LoginResponseDto> {
    return await this.authService.register(createUsuarioDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refrescar tokens de autenticación' })
  @ApiResponse({
    status: 200,
    description: 'Tokens refrescados correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de refresco inválido o expirado.',
  })
  @ApiBody({ schema: { properties: { refreshToken: { type: 'string' } } } })
  async refresh(
    @Body('refreshToken') refreshToken: string,
  ): Promise<LoginResponseDto> {
    return await this.authService.refresh(refreshToken);
  }
}
