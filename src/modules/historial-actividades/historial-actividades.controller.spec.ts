/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// --- MOCKS DE MÓDULOS ---
// 1. Mockear Swagger (¡ESENCIAL!)
// (Necesario porque los DTOs usan @ApiProperty)
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger, // Mantiene ApiProperty, ApiTags, etc.
  ApiOperation: jest.fn(() => jest.fn()), // Mock decorators if needed
  ApiResponse: jest.fn(() => jest.fn()),
  ApiBody: jest.fn(() => jest.fn()),
  ApiQuery: jest.fn(() => jest.fn()),
  ApiTags: jest.fn(() => jest.fn()),
}));

// --- IMPORTS REALES ---
import { Test, TestingModule } from '@nestjs/testing';
import { HistorialActividadesController } from './historial-actividades.controller';
import { HistorialActividadesService } from './historial-actividades.service';
import { CreateHistorialActividadesDto } from './dto/create-historial-actividades.dto';
import { PaginacionDto } from './dto/Paginacion.dto';
import { RespuestaCreateHistorialDto } from './dto/respuesta-create-historial.dto';
import { RespuestaFindAllPaginatedHistorialDTO } from './dto/RespuestaFindAllPaginatedHistorial.dto';

// --- MOCK DATA ---
const mockCreateDto: CreateHistorialActividadesDto = {
  usuario: 1,
  accionId: 10,
  estadoId: 1,
};

const mockRespuestaCreateDto: RespuestaCreateHistorialDto = {
  id: 1,
  usuario: { id: 1 } as any,
  accion: 'Accion Test',
  estado: 'Estado Test',
  fechaHora: new Date(),
};

const mockPaginationDto: PaginacionDto = {
  page: 1,
  limit: 10,
  search: 'test',
  action: 'testAction',
};

const mockPaginatedResponse: RespuestaFindAllPaginatedHistorialDTO = {
  data: [],
  total: 0,
  page: 1,
  lastPage: 0,
};

// --- MOCK PROVIDERS ---
const mockHistorialService = {
  create: jest.fn(),
  findAllPaginated: jest.fn(),
};

// --- TEST SUITE ---
describe('HistorialActividadesController', () => {
  let controller: HistorialActividadesController;
  let service: typeof mockHistorialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistorialActividadesController],
      providers: [
        {
          provide: HistorialActividadesService,
          useValue: mockHistorialService,
        },
      ],
    }).compile();

    controller = module.get<HistorialActividadesController>(
      HistorialActividadesController,
    );
    service = module.get(HistorialActividadesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  // Pruebas para create()
  describe('create', () => {
    it('debería llamar a service.create con el DTO y retornar el resultado', async () => {
      service.create.mockResolvedValue(mockRespuestaCreateDto);

      const result = await controller.create(mockCreateDto);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(mockCreateDto);
      expect(result).toEqual(mockRespuestaCreateDto);
    });
  });

  // Pruebas para findAllPaginated()
  describe('findAllPaginated', () => {
    it('debería llamar a service.findAllPaginated con el DTO de paginación y retornar el resultado', async () => {
      service.findAllPaginated.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAllPaginated(mockPaginationDto);

      expect(service.findAllPaginated).toHaveBeenCalledTimes(1);
      expect(service.findAllPaginated).toHaveBeenCalledWith(mockPaginationDto);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });
});
