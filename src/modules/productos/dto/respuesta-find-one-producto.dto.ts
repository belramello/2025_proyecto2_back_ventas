import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { RespuestaFindOneDetalleProveedorProductoDto } from 'src/modules/detalleproveedorproducto/dto/respuesta-find-one-detalleproveedorproducto.dto';
import { DetalleProveedorProducto } from 'src/modules/detalleproveedorproducto/entities/detalleproveedorproducto.entity';

export class RespuestaFindOneProductoDto {
  @ApiProperty({ example: 3, description: 'ID del producto a buscar' })
  @IsInt()
  @Min(1)
  id: number;
  nombre:string;
  
  codigo:string;
  

  precio:number;
  

  //marca:string; //Reemplazar por entidad Marca

  stock:number;
  

  linea:string; //Reemplazar por entidad Linea
  
  fotoUrl:string;
  
  fechaCreacion:Date;
      
  descripcion:string;
  detalles?: RespuestaFindOneDetalleProveedorProductoDto[];
}
