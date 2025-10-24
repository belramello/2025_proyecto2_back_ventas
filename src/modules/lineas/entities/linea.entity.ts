import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Marca } from "src/modules/marcas/entities/marca.entity";
import { Producto } from "src/modules/productos/entities/producto.entity";
@Entity()
export class Linea {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ unique: true })
    nombre: string;

    @ManyToMany(() => Marca, (marca) => marca.lineas)
    @JoinTable() 
    marcas: Marca[]

    @OneToMany(() => Producto, (producto) => producto.linea)
    productos: Producto[];
}
