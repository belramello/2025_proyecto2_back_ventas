import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class RespuestaFindOneProductoDto {
  @ApiProperty({ example: 3, description: 'ID del producto a buscar' })
  @IsInt()
  @Min(1)
  id: number;
      nombre:string;
  
      codigo:string;
  

      precio:number;
  

      marca:string; //Reemplazar por entidad Marca

      stock:number;
  

      linea:string; //Reemplazar por entidad Linea
  
      fotoUrl:string;
  
      fechaCreacion:Date;
      
      descripcion:string;
}
