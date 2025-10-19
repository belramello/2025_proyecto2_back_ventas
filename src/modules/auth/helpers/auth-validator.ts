import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { UsuarioService } from 'src/modules/usuario/usuario.service';
import { comparePasswords } from './password-helper';

@Injectable()
export class AuthValidator {
  constructor(private readonly userService: UsuarioService) {}

  async validarEmailSinUsar(email: string): Promise<null> {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('El email ya está en uso');
    }
    return existingUser;
  }

  async validarEmailExistente(email: string): Promise<Usuario> {
    const usuario = await this.userService.findByEmail(email);
    if (!usuario) {
      throw new NotFoundException('Usuario con email no encontrado');
    }
    return usuario;
  }

  async validarContraseñaCorrecta(
    contraseñaIngresada: string,
    contraseñaHasheada: string,
  ) {
    const isPasswordValid = await comparePasswords(
      contraseñaIngresada,
      contraseñaHasheada,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Contraseña incorrecta');
    }
  }

  async validarUsuarioExistente(id: number): Promise<Usuario> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }
}
