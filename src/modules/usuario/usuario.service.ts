import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosMappers } from './mappers/usuarios.mappers';
import { Usuario } from './entities/usuario.entity';
import { RespuestaUsuarioDto } from './dto/respuesta-usuario.dto';
import type { IUsuarioRepository } from './repositories/usuarios-repository.interface';
import { UsuariosValidator } from './helpers/usuarios-validator';
import { PaginationDto } from '../ventas/dto/pagination.dto';
import { RespuestaFindAllPaginatedUsuariosDTO } from './dto/respuesta-find-all-usuarios-paginated.dto';
import { UsuarioUpdater } from './helpers/usuario-updater';
import { MailService } from '../mails/mail.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';

@Injectable()
export class UsuarioService {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuariosRepository: IUsuarioRepository,
    private readonly usuarioMappers: UsuariosMappers,
    private readonly usuariosValidator: UsuariosValidator,
    private readonly usuarioUpdater: UsuarioUpdater,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly historialActividades: HistorialActividadesService,
  ) {}
  async createUsuario(
    CreateUsuarioDto: CreateUsuarioDto,
  ): Promise<RespuestaUsuarioDto> {
    const rol = await this.usuariosValidator.validateRolExistente(
      CreateUsuarioDto.rolId,
    );
    const usuario = await this.usuariosRepository.createUsuario(
      CreateUsuarioDto,
      rol,
    );
    return this.usuarioMappers.toResponseDto(usuario);
  }

  async findAllPaginated(
    paginationDto: PaginationDto,
  ): Promise<RespuestaFindAllPaginatedUsuariosDTO> {
    const { limit = 10, page = 1 } = paginationDto;
    return this.usuarioMappers.toRespuestaFindAllPaginatedUsuariosDTO(
      await this.usuariosRepository.findAllPaginated(page, limit),
    );
  }

  async findUsuario(id: number): Promise<RespuestaUsuarioDto> {
    const usuario = await this.usuariosRepository.findOne(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.usuarioMappers.toResponseDto(usuario);
  }

  async findOne(id: number): Promise<Usuario | null> {
    const usuario = await this.usuariosRepository.findOne(id);
    return usuario;
  }

  async actualizarRolDeUsuario(
    usuarioId: number,
    rolId: number,
  ): Promise<void> {
    const rol = await this.usuariosValidator.validateRolExistente(rolId);
    const usuario =
      await this.usuariosValidator.validateUsuarioExistente(usuarioId);
    await this.usuariosRepository.actualizarRolDeUsuario(rol, usuario);
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<RespuestaUsuarioDto> {
    const actualizado = await this.usuarioUpdater.aplicarActualizaciones(
      id,
      updateUsuarioDto,
    );
    await this.usuariosRepository.updateUsuario(actualizado);
    return this.usuarioMappers.toResponseDto(actualizado);
  }

  async delete(id: number): Promise<void> {
    const usuario = await this.usuariosValidator.validateUsuarioExistente(id);
    return await this.usuariosRepository.delete(usuario);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return await this.usuariosRepository.findByEmail(email);
  }
  async forgotPassword(email: string): Promise<void> {
    const accionId = 5;

    const user = await this.usuariosRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expiration = new Date(Date.now() + 3600000); // 1 hora.
      await this.usuariosRepository.guardarTokenReset(email, token, expiration);

      const resetUrl = `${this.configService.get(
        'FRONTEND_URL',
      )}/reset-password?token=${token}`;

      await this.mailService.sendPasswordReset(email, user.nombre, resetUrl);

      await this.historialActividades.create({
        usuario: user.id,
        accionId: accionId,
        estadoId: 1,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      await this.historialActividades.create({
        usuario: user.id,
        accionId: accionId,
        estadoId: 2,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      throw new InternalServerErrorException(
        'Fallo en el proceso de solicitud de restablecimiento de contraseña.',
      );
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usuariosRepository.findOneByResetToken(token);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    if (
      !user.passwordResetExpiration ||
      user.passwordResetExpiration < new Date()
    ) {
      throw new BadRequestException('Token inválido o expirado');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await this.usuariosRepository.updatePassword(user.id, hashedPassword);
  }
}
