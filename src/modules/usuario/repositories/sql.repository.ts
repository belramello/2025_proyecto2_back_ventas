import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { IUsuarioRepository } from './usuarios-repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { Injectable } from '@nestjs/common';
import { hashPassword } from '../../../helpers/password.helper';

@Injectable()
export class UsuarioRepositorySQL implements IUsuarioRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async createUsuario(data: CreateUsuarioDto): Promise<Usuario> {
    const hashedPassword = await hashPassword(data.password);
    const newUsuario = this.usuarioRepository.create({
      ...data,
      password: hashedPassword,
    });
    return await this.usuarioRepository.save(newUsuario);
  }
}
