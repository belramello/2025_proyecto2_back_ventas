import { Rol } from '../../../modules/roles/entities/rol.entity';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { Usuario } from '../entities/usuario.entity';

export interface IUsuarioRepository {
  createUsuario(data: CreateUsuarioDto, rol: Rol): Promise<Usuario>;
  findByEmail(email: string): Promise<Usuario | null>;
  findOne(id: number): Promise<Usuario | null>;
  findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{
    usuarios: Usuario[];
    total: number;
    page: number;
    lastPage: number;
  }>;
  actualizarRolDeUsuario(rol: Rol, usuario: Usuario): Promise<void>;
  delete(usuario: Usuario): Promise<void>;
  updateUsuario(usuario: Usuario): Promise<Usuario>;
}
