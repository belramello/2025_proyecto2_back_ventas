import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

//Tabla Productos
@Entity("Productos")
export class Producto {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    nombre:string;

    @Column()
    precio:number;

    @Column()
    marca:string; //Reemplazar por entidad Marca

    @Column()
    stock:number;

    @Column()
    linea:string; //Reemplazar por entidad Linea

    @Column()
    fotoUrl:string;

    @Column()
    fechaCreacion:Date;

    @Column({nullable:true}) //Puede no tener fecha de actualizacion
    fechaActualizacion:Date;

    @Column({nullable:true}) //Puede no tener fecha de eliminacion
    fechaEliminacion:Date;

    @Column()
    descripcion:string;

    @Column()
    usuarioId:number; //Reemplazar por entidad Usuario
}
