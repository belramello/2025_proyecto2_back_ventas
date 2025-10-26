import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Marca } from '../entities/marca.entity';
import { RespuestaFindAllPaginatedMarcasDTO } from '../dto/respuesta-find-all-paginated-marcas.dto';
import { MarcaResponseDto } from '../dto/marca-response.dto';

@Injectable()
export class MarcaMapper {
  private apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiUrl =
      this.configService.get<string>('API_URL') || 'http://localhost:3000';
    console.log(`[MarcaMapper] API URL configurada como: ${this.apiUrl}`); // Log para verificar
  }

  private buildLogoUrl(logoPathDb?: string | null): string | null {
    if (!logoPathDb) {
      return null;
    }

    if (logoPathDb.includes('uploads/')) {
      return `${this.apiUrl}/${logoPathDb}`;
    } else {
      return `${this.apiUrl}/uploads/logos/${logoPathDb}`;
    }
  }

  toResponseDto(marca: Marca): MarcaResponseDto {
    return {
      id: marca.id,
      nombre: marca.nombre,
      descripcion: marca.descripcion,
      logoUrl: this.buildLogoUrl(marca.logo),
    };
  }

  toResponseDtoList(marcas: Marca[]): MarcaResponseDto[] {
    return marcas.map((marca) => this.toResponseDto(marca));
  }

  toRespuestaFindAllPaginatedMarcasDTO(paginated: {
    marcas: Marca[];
    total: number;
    page: number;
    lastPage: number;
  }): RespuestaFindAllPaginatedMarcasDTO {
    return {
      marcas: this.toResponseDtoList(paginated.marcas),
      total: paginated.total,
      page: paginated.page,
      lastPage: paginated.lastPage,
    };
  }
}
