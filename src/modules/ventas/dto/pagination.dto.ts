import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    description: 'Número máximo de registros a devolver por página',
    type: Number,
    default: 5,
    required: false,
    example: 10,
  })
  @Type(() => Number) //transforma el query string a number
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiProperty({
    description: 'Número de la página a consultar',
    type: Number,
    default: 1,
    required: false,
    example: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  page?: number;
}
