//Atributos para crear un producto
export class CreateProductoDto {
        nombre:string;
        precio:number;
        marca:string;
        stock:number;
        linea:string;
        fotoUrl:string;
        fechaCreacion:Date;
        descripcion:string;
        usuarioId: number;
}
