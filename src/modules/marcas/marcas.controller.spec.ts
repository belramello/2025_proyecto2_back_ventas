import { Test, TestingModule } from '@nestjs/testing';
import { MarcasController } from './marcas.controller';
import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { Marca } from './entities/marca.entity';

// Mock de la entidad Marca para usar en las pruebas
const mockMarca: Marca = {
  id: 1,
  nombre: 'Marca Test',
  descripcion: 'Descripción Test',
  logo: 'logo.png',
  deletedAt: undefined,
};

// Mock del objeto File que Multer nos entregaría
const mockFile: Express.Multer.File = {
  fieldname: 'logo',
  originalname: 'test-logo.png',
  encoding: '7bit',
  mimetype: 'image/png',
  destination: './uploads/logos',
  filename: '123456789.png',
  path: 'uploads/logos/123456789.png',
  size: 12345,
  stream: require('stream').Readable.from([]),
  buffer: Buffer.from([]),
};

// Mock de los métodos del servicio
const mockMarcasService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  restore: jest.fn(),
};

describe('MarcasController', () => {
  let controller: MarcasController;
  let service: typeof mockMarcasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarcasController],
      providers: [
        {
          provide: MarcasService,
          useValue: mockMarcasService, // Aquí provees el mock
        },
      ],
    }).compile();

    controller = module.get<MarcasController>(MarcasController);
    service = module.get(MarcasService);
  });

  // Limpiar mocks después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  // Pruebas para el método create()
  describe('create', () => {
    const createMarcaDto: CreateMarcaDto = { nombre: 'Nueva Marca' };

    it('debería crear una marca con logo', async () => {
      const expectedPath = `uploads/logos/${mockFile.filename}`;
      service.create.mockResolvedValue(mockMarca);

      const result = await controller.create(createMarcaDto, mockFile);

      expect(service.create).toHaveBeenCalledWith(createMarcaDto, expectedPath);
      expect(result).toEqual(mockMarca);
    });

    it('debería crear una marca sin logo (file es undefined)', async () => {
      service.create.mockResolvedValue(mockMarca);

      // CORREGIDO:
      const result = await controller.create(createMarcaDto, undefined); // Simulamos que no se subió archivo

      expect(service.create).toHaveBeenCalledWith(createMarcaDto, undefined);
      expect(result).toEqual(mockMarca);
    });
  });

  // Pruebas para el método findAll()
  describe('findAll', () => {
    it('debería retornar un array de marcas', async () => {
      const marcasArray = [mockMarca];
      service.findAll.mockResolvedValue(marcasArray);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(marcasArray);
    });
  });

  // Pruebas para el método findOne()
  describe('findOne', () => {
    it('debería retornar una marca por ID', async () => {
      const id = '1';
      service.findOne.mockResolvedValue(mockMarca);

      const result = await controller.findOne(id);

      // Verificamos que el string '1' se convierta al número 1
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMarca);
    });
  });

  // Pruebas para el método update()
  describe('update', () => {
    const updateMarcaDto: UpdateMarcaDto = { nombre: 'Marca Actualizada' };
    const id = '1';

    it('debería actualizar una marca con logo', async () => {
      const expectedPath = `uploads/logos/${mockFile.filename}`;
      service.update.mockResolvedValue(mockMarca);

      const result = await controller.update(id, updateMarcaDto, mockFile);

      // Verificamos la conversión de ID y el cálculo del path
      expect(service.update).toHaveBeenCalledWith(
        1,
        updateMarcaDto,
        expectedPath,
      );
      expect(result).toEqual(mockMarca);
    });

    it('debería actualizar una marca sin logo (file es undefined)', async () => {
      service.update.mockResolvedValue(mockMarca);

      const result = await controller.update(id, updateMarcaDto, undefined);

      expect(service.update).toHaveBeenCalledWith(1, updateMarcaDto, undefined);
      expect(result).toEqual(mockMarca);
    });
  });

  // Pruebas para el método remove()
  describe('remove', () => {
    it('debería eliminar una marca por ID', async () => {
      const id = '1';
      service.remove.mockResolvedValue(undefined); // remove retorna void

      await controller.remove(id);

      // Verificamos la conversión de ID
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  // Pruebas para el método restore()
  describe('restore', () => {
    it('debería restaurar una marca por ID', async () => {
      const id = '1';
      service.restore.mockResolvedValue(undefined); // restore retorna void

      await controller.restore(id);

      // Verificamos la conversión de ID
      expect(service.restore).toHaveBeenCalledWith(1);
    });
  });
});
