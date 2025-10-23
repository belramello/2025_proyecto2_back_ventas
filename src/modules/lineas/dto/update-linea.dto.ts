import { PartialType } from '@nestjs/swagger';
import { CreateLineaDto } from './create-linea.dto';

export class UpdateLineaDto extends PartialType(CreateLineaDto) {}
