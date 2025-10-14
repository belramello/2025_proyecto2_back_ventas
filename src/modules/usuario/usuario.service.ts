import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosMappers } from './mappers/usuarios.mappers';
import { Usuario } from './entities/usuario.entity';
import { RespuestaUsuarioDto } from './dto/respuesta-usuario.dto';
import type { IUsuarioRepository } from './repositories/usuarios-repository.interface';
import { UsuariosValidator } from './helpers/usuarios-validator';

@Injectable()
export class UsuarioService {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuariosRepository: IUsuarioRepository,
    private readonly usuarioMappers: UsuariosMappers,
    private readonly usuariosValidator: UsuariosValidator,
  ) {}
  //El usuario se crea desde el endpoint de auth
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

  //hacer paginado para mejorar.
  async findAll(): Promise<RespuestaUsuarioDto[]> {
    const usuarios = await this.usuariosRepository.findAll();
    return this.usuarioMappers.toResponseDtos(usuarios);
  }

  async findMe(id: number): Promise<RespuestaUsuarioDto> {
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

  async actualizarRolDeUsuario(usuarioId: number, rolId: number) {
    const rol = await this.usuariosValidator.validateRolExistente(rolId);
    const usuario =
      await this.usuariosValidator.validateUsuarioExistente(usuarioId);
    await this.usuariosRepository.actualizarRolDeUsuario(rol, usuario);
  }

  //Implementar actualización de información personal.
  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return await this.usuariosRepository.findByEmail(email);
  }
}
