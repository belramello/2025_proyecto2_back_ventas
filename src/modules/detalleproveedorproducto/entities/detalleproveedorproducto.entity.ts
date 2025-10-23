import { PrimaryGeneratedColumn,Column, OneToMany, Entity, ManyToOne } from "typeorm";
import { Producto } from "src/modules/productos/entities/producto.entity";
import { Proveedore } from "src/modules/proveedores/entities/proveedore.entity";


@Entity('detalleproveedorproducto')
export class DetalleProveedorProducto {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    codigo:string; 

    @ManyToOne(() => Proveedore, (proveedor) => proveedor.detalles, { eager: true })
    proveedor: Proveedore;

    @ManyToOne(() => Producto, (producto) => producto.detallesProveedor, { onDelete: 'CASCADE' })
    producto: Producto;
}
