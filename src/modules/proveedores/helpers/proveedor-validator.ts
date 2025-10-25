import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProveedoresRepository } from '../repository/proveedor.repository';
import { Proveedor } from '../entities/proveedore.entity';

@Injectable()
export class ProveedoresValidator {
  constructor(private readonly proveedoresRepository: ProveedoresRepository) {}

    async validateProveedorExistente(id: number): Promise<Proveedor> {
        const proveedor = await this.proveedoresRepository.findOne({ id });
        if (!proveedor || proveedor.fechaEliminacion) {
        throw new NotFoundException(`El proveedor con ID ${id} no existe o fue eliminado`);
        }
        return proveedor;
    }

    async validateProveedorNoDuplicado(nombre: string): Promise<void> {
        const proveedorExistente = await this.proveedoresRepository.findByNombre(nombre);
        if (proveedorExistente) {
            throw new BadRequestException(`Ya existe un proveedor con el nombre "${nombre}"`);
        }
    }

    async validateProveedorEliminable(id: number): Promise<Proveedor> {
        const proveedor = await this.validateProveedorExistente(id);

        return proveedor;
    }
}
