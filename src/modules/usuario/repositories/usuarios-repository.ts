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
import { Rol } from 'src/modules/roles/entities/rol.entity';

@Injectable()
export class UsuarioRepository implements IUsuarioRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async createUsuario(data: CreateUsuarioDto, rol: Rol): Promise<Usuario> {
    try {
      const newUsuario = this.usuarioRepository.create({
        ...data,
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
      const usuario = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .leftJoinAndSelect('usuario.rol', 'rol')
        .leftJoinAndSelect('rol.permisos', 'permisos')
        .where('usuario.email = :email', { email })
        .getOne();

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

  async actualizarRolDeUsuario(rol: Rol, usuario: Usuario): Promise<void> {
    try {
      usuario.rol = rol;
      await this.usuarioRepository.save(usuario);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar el usuario con ID ${usuario.id}: ${error.message}`,
      );
    }
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{
    usuarios: Usuario[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    try {
      const query = this.usuarioRepository
        .createQueryBuilder('usuarios')
        .leftJoinAndSelect('usuarios.rol', 'rol')
        .orderBy('usuarios.fechaCreacion', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [usuarios, total] = await query.getManyAndCount();

      return {
        usuarios,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al encontrar los usuarios paginadas: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<Usuario | null> {
    try {
      const usuario = await this.usuarioRepository
        .createQueryBuilder('usuarios')
        .leftJoinAndSelect('usuarios.rol', 'rol')
        .leftJoinAndSelect('rol.permisos', 'permiso')
        .where('usuarios.id = :id', { id })
        .getOne();

      return usuario || null;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener el usuario con ID ${id}: ${error.message}`,
      );
    }
  }

  async delete(usuario: Usuario): Promise<void> {
    try {
      await this.usuarioRepository.softDelete(usuario);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al eliminar el usuario con ID ${usuario.id}: ${error.message}`,
      );
    }
  }
}
