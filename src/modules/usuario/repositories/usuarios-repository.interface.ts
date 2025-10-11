import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { Usuario } from '../entities/usuario.entity';

export interface IUsuarioRepository {
  createUsuario(data: CreateUsuarioDto): Promise<Usuario>;
}
