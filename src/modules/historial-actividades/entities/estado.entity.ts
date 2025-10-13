import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('estado')
export class Estado {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;
}