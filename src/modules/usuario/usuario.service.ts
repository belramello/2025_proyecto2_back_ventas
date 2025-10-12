import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioRepositorySQL } from './repositories/sql.repository';
import { UsuariosMappers } from './mappers/usuarios.mappers';
import { ConfigService } from '@nestjs/config';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly usuariosRepository: UsuarioRepositorySQL,
    private readonly usuarioMappers: UsuariosMappers,
    private readonly configService: ConfigService,
  ) {}

  async createUsuario(CreateUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    return await this.usuariosRepository.createUsuario(CreateUsuarioDto);
  }

  findAll() {
    return `This action returns all usuario`;
  }

  findOne(id: number): Promise<Usuario | null> {
    return this.usuariosRepository.findOne(id);
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepository.findByEmail(email);
  }
}
