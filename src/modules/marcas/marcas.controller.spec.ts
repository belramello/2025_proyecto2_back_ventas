// --- MOCKS DE MÓDULOS ---
// 1. Mockear Swagger (¡ESENCIAL!)
// (Necesario porque los DTOs usan @ApiProperty)
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger, // Mantiene ApiProperty, ApiTags, etc.
  SwaggerModule: { createDocument: jest.fn(), setup: jest.fn() },
  DocumentBuilder: jest.fn(() => ({
    build: jest.fn(),
  })),
  // Mock common decorators used in controller/DTOs if needed, though ...realSwagger should cover it
  ApiOperation: jest.fn(() => jest.fn()),
  ApiResponse: jest.fn(() => jest.fn()),
  ApiBody: jest.fn(() => jest.fn()),
  ApiParam: jest.fn(() => jest.fn()),
  ApiQuery: jest.fn(() => jest.fn()),
  ApiTags: jest.fn(() => jest.fn()),
}));

// --- IMPORTS REALES ---
import { Test, TestingModule } from '@nestjs/testing';
import { MarcasController } from './marcas.controller';
import { MarcasService } from './marcas.service';
import { AuthGuard } from '../../middlewares/auth.middleware';
import { PermisosGuard } from '../../common/guards/permisos.guard';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { PaginationDto } from './dto/pagination.dto';
import { MarcaResponseDto } from './dto/marca-response.dto';
import { RespuestaFindAllPaginatedMarcasDTO } from './dto/respuesta-find-all-paginated-marcas.dto';

// --- MOCK DATA ---
const mockMarcaResponse: MarcaResponseDto = {
  id: 1,
  nombre: 'Marca Test',
  descripcion: 'Desc Test',
  logoUrl: 'http://localhost:3000/uploads/logos/logo-test.png',
};

// Mock del objeto File que Multer nos entregaría
const mockFile: Express.Multer.File = {
  fieldname: 'logo',
  originalname: 'test-logo.png',
  encoding: '7bit',
  mimetype: 'image/png',
  destination: './uploads/logos',
  filename: 'logo-12345.png', // Solo el nombre del archivo
  path: 'uploads/logos/logo-12345.png',
  size: 12345,
  stream: require('stream').Readable.from([]),
  buffer: Buffer.from([]),
};

// --- MOCK PROVIDERS ---
const mockMarcasService = {
  create: jest.fn(),
  findAllPaginated: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  restore: jest.fn(),
};

// Mock simple para guardias que siempre permiten el acceso
const mockGuard = { canActivate: jest.fn(() => true) };

// --- TEST SUITE ---
describe('MarcasController', () => {
  let controller: MarcasController;
  let service: typeof mockMarcasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarcasController],
      providers: [
        {
          provide: MarcasService,
          useValue: mockMarcasService,
        },
      ],
    })
      // Sobreescribimos los guardias globales del controlador
      .overrideGuard(AuthGuard)
      .useValue(mockGuard)
      // Aunque PermisosGuard se usa vía decorador, lo mockeamos aquí
      // para asegurar que el test no dependa de su lógica real.
      .overrideGuard(PermisosGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<MarcasController>(MarcasController);
    service = module.get(MarcasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  // Pruebas para el método create()
  describe('create', () => {
    const createDto: CreateMarcaDto = { nombre: 'Nueva Marca' };

    it('debería crear una marca con logo', async () => {
      service.create.mockResolvedValue(mockMarcaResponse);
      const dtoConLogo = { ...createDto, logo: mockFile.filename }; // El DTO que el servicio recibe

      const result = await controller.create(createDto, mockFile);

      expect(service.create).toHaveBeenCalledTimes(1);
      // Verificamos que el filename se asignó al DTO antes de llamar al servicio
      expect(service.create).toHaveBeenCalledWith(dtoConLogo);
      expect(result).toEqual(mockMarcaResponse);
    });

    it('debería crear una marca sin logo (file es undefined)', async () => {
      service.create.mockResolvedValue(mockMarcaResponse);
      // El DTO no tendrá la propiedad 'logo' definida
      const dtoSinLogo = { ...createDto };

      const result = await controller.create(createDto, undefined); // Sin archivo

      expect(service.create).toHaveBeenCalledTimes(1);
      // Verificamos que el DTO pasado no tiene 'logo'
      expect(service.create).toHaveBeenCalledWith(dtoSinLogo);
      expect(result).toEqual(mockMarcaResponse);
    });
  });

  // Pruebas para el método findAll()
  describe('findAll', () => {
    it('debería llamar a findAllPaginated con el DTO de paginación', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const expectedResult: RespuestaFindAllPaginatedMarcasDTO = {
        marcas: [mockMarcaResponse],
        total: 1,
        page: 1,
        lastPage: 1,
      };
      service.findAllPaginated.mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto);

      expect(service.findAllPaginated).toHaveBeenCalledTimes(1);
      expect(service.findAllPaginated).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(expectedResult);
    });
  });

  // Pruebas para el método findOne()
  describe('findOne', () => {
    it('debería llamar a findOne con el ID parseado', async () => {
      service.findOne.mockResolvedValue(mockMarcaResponse);

      const result = await controller.findOne(1); // El pipe parsea a número

      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(1); // Verifica que sea número
      expect(result).toEqual(mockMarcaResponse);
    });
  });

  // Pruebas para el método update()
  describe('update', () => {
    const updateDtoBase: UpdateMarcaDto = { nombre: 'Nombre Actualizado' };
    const id = 1;

    it('debería actualizar una marca con nuevo logo', async () => {
      service.update.mockResolvedValue(mockMarcaResponse);
      // El DTO que el servicio recibe (con id y logo asignados)
      const dtoFinal = { ...updateDtoBase, id: id, logo: mockFile.filename };

      const result = await controller.update(id, updateDtoBase, mockFile);

      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith(id, dtoFinal);
      expect(result).toEqual(mockMarcaResponse);
    });

    it('debería actualizar una marca sin cambiar el logo (file es undefined)', async () => {
      service.update.mockResolvedValue(mockMarcaResponse);
      // El DTO que el servicio recibe (con id, sin logo)
      const dtoFinal = { ...updateDtoBase, id: id };

      const result = await controller.update(id, updateDtoBase, undefined); // Sin archivo

      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith(id, dtoFinal);
      expect(result).toEqual(mockMarcaResponse);
    });
  });

  // Pruebas para el método remove()
  describe('remove', () => {
    it('debería llamar a remove con el ID parseado', async () => {
      service.remove.mockResolvedValue(undefined); // Retorna void

      // No necesitamos guardar el resultado porque es void
      await controller.remove(1); // El pipe parsea a número

      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(service.remove).toHaveBeenCalledWith(1); // Verifica que sea número
    });
  });

  // Pruebas para el método restore()
  describe('restore', () => {
    it('debería llamar a restore con el ID parseado', async () => {
      service.restore.mockResolvedValue(undefined); // Retorna void

      await controller.restore(1); // El pipe parsea a número

      expect(service.restore).toHaveBeenCalledTimes(1);
      expect(service.restore).toHaveBeenCalledWith(1); // Verifica que sea número
    });
  });
});
