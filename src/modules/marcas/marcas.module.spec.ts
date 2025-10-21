import { Test, TestingModule } from '@nestjs/testing';
import { MarcasController } from './marcas.controller';
import { MarcasService } from './marcas.service';
import { MarcaRepository } from './repositories/marca-repository';
import { MarcaNombreUniqueValidator } from './helpers/marcas-validator';

describe('MarcasModule', () => {
  let module: TestingModule;

  // Mocks vacíos para satisfacer la inyección de dependencias
  const mockMarcaRepository = {};
  const mockMarcaValidator = {};

  beforeEach(async () => {
    module = await Test.createTestingModule({
      // NO usamos imports: [MarcasModule]
      // En su lugar, declaramos los componentes del módulo aquí
      controllers: [MarcasController], // El controlador real
      providers: [
        MarcasService, // El servicio real
        {
          provide: MarcaRepository, // Mockeamos el Repositorio
          useValue: mockMarcaRepository,
        },
        {
          provide: MarcaNombreUniqueValidator, // Mockeamos el Validador
          useValue: mockMarcaValidator,
        },
      ],
    }).compile();
  });

  it('debería compilar el módulo exitosamente', () => {
    // Si beforeEach se completa sin errores, el módulo compiló.
    expect(module).toBeDefined();
  });

  it('debería resolver (inyectar) MarcasController', () => {
    // Verificamos que Nest puede instanciar el controlador.
    // Nest le inyectará automáticamente el MarcasService real (que a su vez usa el mock de MarcaRepository).
    const controller = module.get<MarcasController>(MarcasController);
    expect(controller).toBeDefined();
  });

  it('debería resolver (inyectar) MarcasService', () => {
    // Verificamos que Nest puede instanciar el servicio.
    // Nest le inyectará el mock de MarcaRepository que definimos.
    const service = module.get<MarcasService>(MarcasService);
    expect(service).toBeDefined();
  });

  it('debería resolver (inyectar) MarcaRepository (como mock)', () => {
    // Verificamos que nuestro mock está siendo inyectado
    const repository = module.get<MarcaRepository>(MarcaRepository);
    expect(repository).toBeDefined();
    expect(repository).toBe(mockMarcaRepository);
  });

  it('debería resolver (inyectar) MarcaNombreUniqueValidator (como mock)', () => {
    // Verificamos que nuestro mock está siendo inyectado
    const validator = module.get<MarcaNombreUniqueValidator>(
      MarcaNombreUniqueValidator,
    );
    expect(validator).toBeDefined();
    expect(validator).toBe(mockMarcaValidator);
  });
});
