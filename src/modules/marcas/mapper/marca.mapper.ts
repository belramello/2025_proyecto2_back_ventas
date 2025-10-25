import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Marca } from '../entities/marca.entity';
import { RespuestaFindAllPaginatedMarcasDTO } from '../dto/respuesta-find-all-paginated-marcas.dto';
import { MarcaResponseDto } from '../dto/marca-response.dto';

@Injectable()
export class MarcaMapper {
  private apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('API_URL') || 'http://localhost:3000';
    console.log(`[MarcaMapper] API URL configurada como: ${this.apiUrl}`); // Log para verificar
  }

  // --- FUNCIÓN CORREGIDA (DE NUEVO) ---
  private buildLogoUrl(logoPathDb?: string | null): string | null {
    if (!logoPathDb) {
      return null; // Si no hay logo en la BD, devolvemos null
    }

    // Verificamos si la ruta de la BD ya incluye 'uploads/' (para evitar duplicar)
    // Usamos includes() por si acaso hay alguna variación leve
    if (logoPathDb.includes('uploads/')) {
      // Si ya contiene 'uploads/', asumimos que es la ruta relativa correcta desde la raíz del servidor
      // Solo le agregamos la base de la API URL
      return `${this.apiUrl}/${logoPathDb}`;
    } else {
      // Si solo tiene el nombre del archivo (caso ideal futuro), construimos la ruta completa
      return `${this.apiUrl}/uploads/logos/${logoPathDb}`;
    }
  }
  // --- FIN FUNCIÓN CORREGIDA ---

  toResponseDto(marca: Marca): MarcaResponseDto {
    const responseDto = new MarcaResponseDto();
    responseDto.id = marca.id;
    responseDto.nombre = marca.nombre;
    responseDto.descripcion = marca.descripcion;
    responseDto.logoUrl = this.buildLogoUrl(marca.logo); // La lógica está encapsulada
    return responseDto;
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