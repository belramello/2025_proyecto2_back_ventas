import { PartialType } from '@nestjs/swagger';
import { CreateVentaDto } from './create-venta.dto';

export class UpdateVentaDto extends PartialType(CreateVentaDto) {}
