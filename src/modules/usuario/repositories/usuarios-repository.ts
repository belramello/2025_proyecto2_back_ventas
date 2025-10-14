import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { IUsuarioRepository } from './usuarios-repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { hashPassword } from '../../../helpers/password.helper';
import { Rol } from 'src/modules/roles/entities/rol.entity';

@Injectable()
export class UsuarioRepository implements IUsuarioRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async createUsuario(data: CreateUsuarioDto, rol: Rol): Promise<Usuario> {
    try {
      const hashedPassword = await hashPassword(data.password);
      const newUsuario = this.usuarioRepository.create({
        ...data,
        password: hashedPassword,
        rol,
      });
      return await this.usuarioRepository.save(newUsuario);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear el usuario: ${error.message}`,
      );
    }
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    try {
      const usuario = this.usuarioRepository.findOne({
        where: { email },
        relations: ['rol'],
      });
      return usuario;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al obtener el usuario con email ${email}: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<Usuario | null> {
    try {
      const usuario = this.usuarioRepository.findOne({
        where: { id },
        relations: ['rol'],
      });
      return usuario;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener el usuario con ID ${id}: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Usuario[]> {
    try {
      return this.usuarioRepository.find({
        relations: ['rol'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener usuarios: ${error.message}`,
      );
    }
  }
}
