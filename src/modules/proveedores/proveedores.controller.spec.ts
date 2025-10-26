// --- MOCKS DE MÓDULOS ---
// 1. Mockear Swagger (¡ESENCIAL!)
// (Necesario porque los DTOs usan @ApiProperty)
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger, // Mantiene ApiProperty, ApiTags, etc.
  // Mock implementations aren't strictly needed here unless module loading fails
  ApiOperation: jest.fn(() => jest.fn()),
  ApiResponse: jest.fn(() => jest.fn()),
  ApiBody: jest.fn(() => jest.fn()),
  ApiParam: jest.fn(() => jest.fn()),
  ApiTags: jest.fn(() => jest.fn()),
}));

// --- IMPORTS REALES ---
import { Test, TestingModule } from '@nestjs/testing';
import { ProveedoresController } from './proveedores.controller';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedoreDto } from './dto/create-proveedore.dto';
import { PaginationProveedoresDto } from './dto/pagination.dto';
import { DeleteProveedoreDto } from './dto/delete-proveedore.dto';
import { Proveedor } from './entities/proveedore.entity'; // Asumiendo que el service puede devolver la entidad
import { RespuestaFindOneProveedorDto } from './dto/respuesta-find-one-proveedor.dto';
import { RespuestaFindAllPaginatedProveedorDTO } from './dto/respuesta-find-all-paginated.dto';
import { UpdateResult } from 'typeorm'; // Para el resultado de remove

// --- MOCK DATA ---
const mockProveedor: Proveedor = {
  id: 1,
  nombre: 'Librería Máximo',
  direccion: 'Av. Siempre Viva 742',
  email: 'max@test.com',
  contacto: '123456',
  provincia: 'Santa Fe',
  localidad: 'Rosario',
  // Simular otras propiedades si existen en la entidad real
} as Proveedor;

const mockProveedorResponseDto: RespuestaFindOneProveedorDto = {
  id: 1,
  nombre: 'Librería Máximo',
  direccion: 'Av. Siempre Viva 742',
  email: 'max@test.com',
  contacto: '123456',
  provincia: 'Santa Fe',
  localidad: 'Rosario',
};

const mockCreateDto: CreateProveedoreDto = {
  nombre: 'Librería Nueva',
  direccion: 'Calle Falsa 123',
  email: 'nueva@test.com',
  contacto: '789012',
  provincia: 'Corrientes',
  localidad: 'Corrientes',
};

// --- MOCK PROVIDERS ---
const mockProveedoresService = {
  create: jest.fn(),
  findAllPaginated: jest.fn(),
  findOne: jest.fn(),
  findByNombre: jest.fn(),
  remove: jest.fn(),
};

// --- TEST SUITE ---
describe('ProveedoresController', () => {
  let controller: ProveedoresController;
  let service: typeof mockProveedoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProveedoresController],
      providers: [
        {
          provide: ProveedoresService,
          useValue: mockProveedoresService,
        },
      ],
    }).compile();

    controller = module.get<ProveedoresController>(ProveedoresController);
    service = module.get(ProveedoresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  // Pruebas para create()
  describe('create', () => {
    it('debería llamar a service.create con el DTO correcto', async () => {
      service.create.mockResolvedValue(mockProveedor); // Asumimos que create devuelve la entidad creada

      const result = await controller.create(mockCreateDto);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(mockCreateDto);
      expect(result).toEqual(mockProveedor); // O el DTO de respuesta si el servicio mapea
    });
  });

  // Pruebas para findAll()
  describe('findAll', () => {
    it('debería llamar a service.findAllPaginated con el DTO de paginación', async () => {
      const paginationDto: PaginationProveedoresDto = { page: 2, limit: 5 };
      const expectedResult: RespuestaFindAllPaginatedProveedorDTO = {
        proveedores: [mockProveedorResponseDto], // Usar DTO de respuesta
        total: 1,
        page: 2,
        lastPage: 1,
      };
      service.findAllPaginated.mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto);

      expect(service.findAllPaginated).toHaveBeenCalledTimes(1);
      expect(service.findAllPaginated).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(expectedResult);
    });
  });

  // Pruebas para findOne()
  describe('findOne', () => {
    it('debería llamar a service.findOne con el ID convertido a número', async () => {
      service.findOne.mockResolvedValue(mockProveedor); // Asumimos que findOne devuelve la entidad

      const result = await controller.findOne('1'); // ID como string

      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(1); // Verifica que se convierte a número
      expect(result).toEqual(mockProveedor); // O el DTO de respuesta si el servicio mapea
    });
  });

  // Pruebas para findByNombre()
  describe('findByNombre', () => {
    it('debería llamar a service.findByNombre con el nombre', async () => {
      const nombre = 'Librería Máximo';
      service.findByNombre.mockResolvedValue(mockProveedor); // Asumimos que devuelve la entidad

      const result = await controller.findByNombre(nombre);

      expect(service.findByNombre).toHaveBeenCalledTimes(1);
      expect(service.findByNombre).toHaveBeenCalledWith(nombre);
      expect(result).toEqual(mockProveedor); // O el DTO de respuesta si el servicio mapea
    });
  });

  // Pruebas para remove()
  describe('remove', () => {
    it('debería construir el DeleteDto y llamar a service.remove', async () => {
      const deleteResult = { affected: 1 } as UpdateResult; // Resultado de soft delete
      service.remove.mockResolvedValue(deleteResult);
      const idString = '1';
      const expectedDto: DeleteProveedoreDto = { id: 1 }; // El DTO esperado

      const result = await controller.remove(idString);

      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(service.remove).toHaveBeenCalledWith(expectedDto); // Verifica el DTO construido
      expect(result).toEqual(deleteResult);
    });
  });
});
