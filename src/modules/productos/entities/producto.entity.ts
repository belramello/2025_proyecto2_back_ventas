import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

//Tabla Productos
@Entity("productos")
export class Producto {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    nombre:string;

    @Column()
    codigo:string;

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

    @CreateDateColumn() 
    fechaCreacion:Date;

    @UpdateDateColumn({nullable:true}) //Puede no tener fecha de actualizacion
    fechaActualizacion:Date | null;;

    @DeleteDateColumn({nullable:true}) //Puede no tener fecha de eliminacion
    fechaEliminacion:Date | null;;

    @Column()
    descripcion:string;

    @Column()
    usuarioId:number; //Reemplazar por entidad Usuario
}
