import { IsArray, IsInt, IsIn, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DetalleVentaDto } from '../detalle-ventas/dto/detalle-venta.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVentaDto {
  @ApiProperty({
    description: 'Lista de detalles (producto y cantidad) para la venta',
    type: [DetalleVentaDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleVentaDto)
  detalles: DetalleVentaDto[];

  @ApiProperty({
    description: 'Medio de pago',
    enum: ['efectivo', 'credito', 'debito'],
    example: 'efectivo',
  })
  @IsIn(['efectivo', 'credito', 'debito'])
  medioDePago: 'efectivo' | 'credito' | 'debito';

  //Para cuando se aplique lo de autenticación, se elimina esto del dto.
  @ApiProperty({
    description:
      'ID del usuario que crea la venta (se quitará cuando haya auth)',
    example: 42,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usuarioId: number;
}
