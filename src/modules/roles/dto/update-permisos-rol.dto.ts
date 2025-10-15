import { IsArray } from 'class-validator';

export class UpdatePermisosRolDto {
  @IsArray()
  permisosId: number[];
}
