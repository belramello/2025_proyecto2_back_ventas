import { ApiProperty } from "@nestjs/swagger";

export class RespuestaFindOneDetalleProveedorProductoDto{
    @ApiProperty({ example: 1 })
    id: number;
    @ApiProperty({description: 'ID del producto asociado al proveedor cargado', example:'S123JF'})
    codigo:string; 

    @ApiProperty({description: 'ID del proveedor ', example:5})
    proveedorId:number; 

    @ApiProperty({description: 'Nombre del proveedor ', example:'Librería Máximo'})
    proveedorNombre:string; 

    @ApiProperty({description: 'ID del producto ', example:5})
    productoId:number; 

    @ApiProperty({description: 'Nombre del producto ', example:'Lapicera Bic'})
    productoNombre:string; 


}