import { Inject, Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosMappers } from './mappers/usuarios.mappers';
import { Usuario } from './entities/usuario.entity';
import { RespuestaUsuarioDto } from './dto/respuesta-usuario.dto';
import type { IUsuarioRepository } from './repositories/usuarios-repository.interface';

@Injectable()
export class UsuarioService {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuariosRepository: IUsuarioRepository,
    private readonly usuarioMappers: UsuariosMappers,
  ) {}
  //El usuario se crea desde el endpoint de auth
  async createUsuario(
    CreateUsuarioDto: CreateUsuarioDto,
  ): Promise<RespuestaUsuarioDto> {
    return this.usuarioMappers.toResponseDto(
      await this.usuariosRepository.createUsuario(CreateUsuarioDto),
    );
  }

  //hacer paginado para mejorar.
  async findAll(): Promise<RespuestaUsuarioDto[]> {
    const usuarios = await this.usuariosRepository.findAll();
    return this.usuarioMappers.toResponseDtos(usuarios);
  }

  async findOne(id: number): Promise<RespuestaUsuarioDto> {
    const usuario = await this.usuariosRepository.findOne(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return this.usuarioMappers.toResponseDto(usuario);
  }

  //Implementar actualización de información personal.
  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepository.findByEmail(email);
  }
}
