//Atributos para crear un producto
export class CreateProductoDto {
  nombre: string;
  precio: number;
  marca: string;
  stock: number;
  linea: string;
  fotoUrl: string;
  descripcion: string;
  usuarioId: number;
}
