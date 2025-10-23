import { Test, TestingModule } from '@nestjs/testing';
import { MarcasService } from './marcas.service';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> a34b23287d8d09cdb20af3b8a1237d335dc23a83
=======
>>>>>>> 155b136ece8b684acc2b5484a9d72c73b41e6314
import { MarcaRepository } from './repositories/marca-repository';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Marca } from './entities/marca.entity';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';

// Mock de la entidad Marca para usar en las pruebas
const mockMarca: Marca = {
  id: 1,
  nombre: 'Marca Test',
  descripcion: 'Descripción Test',
  logo: 'logo.png',
  deletedAt: undefined,
};

// Mock del Repositorio
// Creamos un tipo que simula los métodos que el servicio va a llamar
type MockRepository = Partial<Record<keyof MarcaRepository, jest.Mock>>;

const createMockRepository = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  findByNombre: jest.fn(),
  softRemove: jest.fn(),
  restore: jest.fn(),
});

describe('MarcasService', () => {
  let service: MarcasService;
  let repository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarcasService,
        {
          provide: MarcaRepository, // Puedes usar getRepositoryToken(Marca) si así lo inyectas
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<MarcasService>(MarcasService);
    repository = module.get<MockRepository>(MarcaRepository);
  });

  // Limpiar mocks después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // Pruebas para el método create()
  describe('create', () => {
    const createMarcaDto: CreateMarcaDto = { nombre: 'Nueva Marca' };
    const logoPath = 'path/to/logo.jpg';

    it('debería crear y guardar una marca con logo', async () => {
      const expectedMarca = { ...mockMarca, ...createMarcaDto, logo: logoPath };

      repository.create?.mockReturnValue(expectedMarca);
      repository.save?.mockResolvedValue(expectedMarca);

      const result = await service.create(createMarcaDto, logoPath);

      expect(repository.create).toHaveBeenCalledWith({
        ...createMarcaDto,
        logo: logoPath,
      });
      expect(repository.save).toHaveBeenCalledWith(expectedMarca);
      expect(result).toEqual(expectedMarca);
    });

    it('debería crear y guardar una marca sin logo', async () => {
      const expectedMarca = {
        ...mockMarca,
        ...createMarcaDto,
        logo: undefined,
      };

      repository.create?.mockReturnValue(expectedMarca);
      repository.save?.mockResolvedValue(expectedMarca);

      const result = await service.create(createMarcaDto); // Sin logoPath

      expect(repository.create).toHaveBeenCalledWith({
        ...createMarcaDto,
        logo: undefined,
      });
      expect(repository.save).toHaveBeenCalledWith(expectedMarca);
      expect(result).toEqual(expectedMarca);
    });
  });

  // Pruebas para el método findAll()
  describe('findAll', () => {
    it('debería retornar un array de marcas', async () => {
      const marcasArray = [mockMarca];
      repository.find?.mockResolvedValue(marcasArray);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(marcasArray);
    });
  });

  // Pruebas para el método findOne()
  describe('findOne', () => {
    it('debería retornar una marca si la encuentra', async () => {
      repository.findOneBy?.mockResolvedValue(mockMarca);

      const result = await service.findOne(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockMarca);
    });

    it('debería lanzar BadRequestException si la marca no se encuentra', async () => {
      repository.findOneBy?.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(BadRequestException);
      await expect(service.findOne(99)).rejects.toThrow('Marca no encontrada');
    });
  });

  // Pruebas para el método update()
  describe('update', () => {
    const updateMarcaDto: UpdateMarcaDto = { nombre: 'Nombre Actualizado' };
    const logoPath = 'new/logo.png';
    const id = 1;

    // Spy en findOne del propio servicio para mockear su comportamiento interno
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      // Mockeamos el findOne interno que usa el update
      // Lo espiamos para poder controlarlo en cada test
      findOneSpy = jest.spyOn(service, 'findOne');
    });

    it('debería actualizar una marca (con nuevo nombre y logo)', async () => {
      const updatedMarca = { ...mockMarca, ...updateMarcaDto, logo: logoPath };

      // 1. Primer findOne (dentro de update)
      findOneSpy.mockResolvedValueOnce(mockMarca);
      // 2. Conflicto de nombre
      repository.findByNombre?.mockResolvedValue(null); // No hay conflicto
      // 3. Update
      repository.update?.mockResolvedValue(undefined); // El update de TypeORM no retorna nada
      // 4. Segundo findOne (al final de update)
      findOneSpy.mockResolvedValueOnce(updatedMarca);

      const result = await service.update(id, updateMarcaDto, logoPath);

      expect(findOneSpy).toHaveBeenCalledWith(id);
      expect(repository.findByNombre).toHaveBeenCalledWith(
        updateMarcaDto.nombre,
      );
      expect(repository.update).toHaveBeenCalledWith(id, {
        ...updateMarcaDto,
        logo: logoPath,
      });
      expect(result).toEqual(updatedMarca);
    });

    it('debería actualizar una marca (solo descripción, sin cambio de nombre ni logo)', async () => {
      const dtoSoloDesc: UpdateMarcaDto = { descripcion: 'Nueva Desc' };
      const updatedMarca = { ...mockMarca, ...dtoSoloDesc };

      // 1. Primer findOne
      findOneSpy.mockResolvedValueOnce(mockMarca);
      // 3. Update
      repository.update?.mockResolvedValue(undefined);
      // 4. Segundo findOne
      findOneSpy.mockResolvedValueOnce(updatedMarca);

      const result = await service.update(id, dtoSoloDesc);

      expect(findOneSpy).toHaveBeenCalledWith(id);
      // No se debe llamar a findByNombre si el nombre no cambia
      expect(repository.findByNombre).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(id, dtoSoloDesc);
      expect(result).toEqual(updatedMarca);
    });

    it('debería actualizar una marca (nombre enviado es el mismo, no chequea conflicto)', async () => {
      const dtoMismoNombre: UpdateMarcaDto = { nombre: mockMarca.nombre };

      findOneSpy.mockResolvedValueOnce(mockMarca);
      repository.update?.mockResolvedValue(undefined);
      findOneSpy.mockResolvedValueOnce(mockMarca); // Retorna la misma marca

      await service.update(id, dtoMismoNombre);

      expect(findOneSpy).toHaveBeenCalledWith(id);
      // No debe chequear conflicto si el nombre es el mismo
      expect(repository.findByNombre).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(id, dtoMismoNombre);
    });

    it('debería lanzar ConflictException si el nuevo nombre ya existe', async () => {
      const existingMarca = { ...mockMarca, id: 2 }; // Otra marca con el mismo nombre

      // 1. Primer findOne
      findOneSpy.mockResolvedValueOnce(mockMarca);
      // 2. Conflicto de nombre
      repository.findByNombre?.mockResolvedValue(existingMarca); // Conflicto encontrado

      await expect(
        service.update(id, updateMarcaDto, logoPath),
      ).rejects.toThrow(ConflictException);
      expect(repository.findByNombre).toHaveBeenCalledWith(
        updateMarcaDto.nombre,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si la marca a actualizar no existe', async () => {
      // 1. Primer findOne falla
      findOneSpy.mockRejectedValue(
        new BadRequestException('Marca no encontrada'),
      );

      await expect(service.update(id, updateMarcaDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findByNombre).not.toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  // Pruebas para el método remove()
  describe('remove', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest.spyOn(service, 'findOne');
    });

    it('debería eliminar lógicamente una marca', async () => {
      findOneSpy.mockResolvedValue(mockMarca);
      repository.softRemove?.mockResolvedValue(undefined); // softRemove no retorna nada

      await service.remove(1);

      expect(findOneSpy).toHaveBeenCalledWith(1);
      expect(repository.softRemove).toHaveBeenCalledWith(mockMarca);
    });

    it('debería lanzar BadRequestException si la marca a eliminar no existe', async () => {
      findOneSpy.mockRejectedValue(
        new BadRequestException('Marca no encontrada'),
      );

      await expect(service.remove(99)).rejects.toThrow(BadRequestException);
      expect(repository.softRemove).not.toHaveBeenCalled();
    });
  });

  // Pruebas para el método restore()
  describe('restore', () => {
    const id = 1;
    const deletedMarca = { ...mockMarca, deletedAt: new Date() };
    const notDeletedMarca = { ...mockMarca, deletedAt: null };

    it('debería restaurar una marca eliminada lógicamente', async () => {
      repository.findOne?.mockResolvedValue(deletedMarca);
      repository.restore?.mockResolvedValue(undefined);

      await service.restore(id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id },
        withDeleted: true,
      });
      expect(repository.restore).toHaveBeenCalledWith(id);
    });

    it('debería lanzar BadRequestException si la marca no se encuentra (ni siquiera borrada)', async () => {
      repository.findOne?.mockResolvedValue(null);

      await expect(service.restore(id)).rejects.toThrow(BadRequestException);
      await expect(service.restore(id)).rejects.toThrow('Marca no encontrada');
      expect(repository.restore).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si la marca no está eliminada', async () => {
      repository.findOne?.mockResolvedValue(notDeletedMarca);

      await expect(service.restore(id)).rejects.toThrow(BadRequestException);
      await expect(service.restore(id)).rejects.toThrow(
        'La marca no se encuentra eliminada',
      );
      expect(repository.restore).not.toHaveBeenCalled();
    });
  });
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 155b136ece8b684acc2b5484a9d72c73b41e6314
=======

describe('MarcasService', () => {
  let service: MarcasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarcasService],
    }).compile();

    service = module.get<MarcasService>(MarcasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
>>>>>>> 6ff62d53cd6513f49d98258a7d127e3026125ebe
<<<<<<< HEAD
=======
>>>>>>> a34b23287d8d09cdb20af3b8a1237d335dc23a83
=======
>>>>>>> 155b136ece8b684acc2b5484a9d72c73b41e6314
});
