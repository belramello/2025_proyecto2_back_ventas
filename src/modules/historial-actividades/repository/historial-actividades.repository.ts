import { InjectRepository } from "@nestjs/typeorm";
import { IHistorialActividadesRepository } from "./historial-actividades-repository.interface";
import { HistorialActividades } from "../entities/historial-actividade.entity";
import { Repository } from "typeorm";
import { CreateHistorialActividadesDto } from "../dto/create-historial-actividade.dto";
import { InternalServerErrorException } from "@nestjs/common";

export class HistorialActividadesRepository implements IHistorialActividadesRepository {
  constructor(
    @InjectRepository(HistorialActividades)
    private readonly historialRepository: Repository<HistorialActividades>,
  ) {}
    async create(data: CreateHistorialActividadesDto): Promise<HistorialActividades> {
        this.historialRepository.create({...data});
        return this.historialRepository.save(data);
    }
 async findAllPaginated(
     page: number,
     limit: number,
 ): Promise<{
     historial: HistorialActividades[];
     total: number;
     page: number;
     lastPage: number;
 }>  {
        try {
          const query = this.historialRepository.createQueryBuilder('historial')
                .leftJoinAndSelect('historial.accion', 'accion')
                .leftJoinAndSelect('historial.estado', 'estado')
                .orderBy('historial.fechaHora', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
    
          const [historial, total] = await query.getManyAndCount();
          return {
            historial,
            total,
            page,
            lastPage: Math.ceil(total / limit),
          };
        } catch (error) {
          throw new InternalServerErrorException(
            `Error al encontrar las ventas paginadas: ${error.message}`,
          );
        }
      }
    

}