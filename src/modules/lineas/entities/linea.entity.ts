import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Marca } from "src/modules/marcas/entities/marca.entity";
import { Producto } from "src/modules/productos/entities/producto.entity";
@Entity()
export class Linea {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ unique: true })
    nombre: string;

    @ManyToOne(() => Marca, (marca) => marca.lineas)
    marca: Marca;

    @OneToMany(() => Producto, (producto) => producto.linea)
    productos: Producto[];
}
