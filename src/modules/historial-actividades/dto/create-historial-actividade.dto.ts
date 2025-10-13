import { Accion } from "../entities/accion.entity";
import { Estado } from "../entities/estado.entity";

export class CreateHistorialActividadesDto {
        usuario: number;
        accion: Accion;
        estado:Estado;
}
