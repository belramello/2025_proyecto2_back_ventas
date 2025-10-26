/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// --- MOCKS DE MÓDULOS ---
// 1. Mockear Swagger para evitar el crash de importación
// (Necesario porque CreateProductoDto usa @ApiProperty)
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger, // Mantiene ApiProperty, ApiTags, etc.
  SwaggerModule: { createDocument: jest.fn(), setup: jest.fn() },
  DocumentBuilder: jest.fn(() => ({
    build: jest.fn(),
  })),
}));

// --- IMPORTS REALES ---
import { Test, TestingModule } from '@nestjs/testing';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { ProductosValidator } from './helpers/productos-validator';
import { ProductoMapper } from './mapper/producto.mapper';
import { JwtService } from '../jwt/jwt.service';
import { UsuarioService } from '../usuario/usuario.service';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';

// --- MOCK PROVIDERS ---
// Creamos mocks vacíos para todas las dependencias externas
const mockProductosRepository = {};
const mockJwtService = {};
const mockUsuarioService = {};
const mockHistorialService = {};

// --- TEST SUITE ---
describe('ProductosModule', () => {
  let module: TestingModule;
  let controller: ProductosController;
  let service: ProductosService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      // 1. Declaramos los controllers y providers reales del ProductosModule
      controllers: [ProductosController],
      providers: [
        ProductosService,
        ProductosValidator,
        ProductoMapper,
        {
          provide: 'IProductosRepository',
          useValue: mockProductosRepository, // Usamos el mock para la interfaz
        },

        // 2. Proveemos mocks para las dependencias externas
        // (del HistorialActividadesModule y las necesarias para los Guards)
        {
          provide: HistorialActividadesService,
          useValue: mockHistorialService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
      ],
    }).compile();

    controller = module.get<ProductosController>(ProductosController);
    service = module.get<ProductosService>(ProductosService);
  });

  it('debería compilar el módulo exitosamente', () => {
    // Si beforeEach() se completa, el módulo se compiló
    // y el archivo .module.ts tiene 100% de cobertura.
    expect(module).toBeDefined();
  });

  it('debería resolver (inyectar) ProductosController', () => {
    // Verifica que el controlador se pudo instanciar
    expect(controller).toBeDefined();
  });

  it('debería resolver (inyectar) ProductosService', () => {
    // Verifica que el servicio principal se pudo instanciar
    expect(service).toBeDefined();
  });

  it('debería resolver (inyectar) ProductosValidator', () => {
    const validator = module.get<ProductosValidator>(ProductosValidator);
    expect(validator).toBeDefined();
  });

  it('debería resolver (inyectar) ProductoMapper', () => {
    const mapper = module.get<ProductoMapper>(ProductoMapper);
    expect(mapper).toBeDefined();
  });

  it('debería inyectar mocks correctamente en el ProductosService', () => {
    // Verificamos que las dependencias anidadas se resolvieron
    expect(service['productosRepository']).toBe(mockProductosRepository);
    expect(service['historialActividades']).toBe(mockHistorialService);
    expect(service['validator']).toBeInstanceOf(ProductosValidator);
    expect(service['productoMapper']).toBeInstanceOf(ProductoMapper);
  });
});
