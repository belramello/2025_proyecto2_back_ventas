/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// --- MOCKS DE MÓDULOS ---
const realSwagger = jest.requireActual('@nestjs/swagger');
jest.mock('@nestjs/swagger', () => ({
  ...realSwagger,
  SwaggerModule: { createDocument: jest.fn(), setup: jest.fn() },
  DocumentBuilder: jest.fn(() => ({
    build: jest.fn(),
  })),
}));

// --- IMPORTS REALES ---
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { ProductosValidator } from './helpers/productos-validator';
import { ProductoMapper } from './mapper/producto.mapper'; // Importar el mapper real
import { IProductosRepository } from './repository/producto-repository.interface';
import { Producto } from './entities/producto.entity';
import { DetalleProveedorProductoService } from '../detalleproveedorproducto/detalleproveedorproducto.service';
import { JwtService } from '../jwt/jwt.service';
import { UsuarioService } from '../usuario/usuario.service';
import { HistorialActividadesService } from '../historial-actividades/historial-actividades.service';
import { MarcaValidator } from '../marcas/helpers/marcas-validator';
import { LineasValidator } from '../lineas/helpers/lineas-validator';
// ¡AÑADIDOS! Dependencias del ProductoMapper
import { DetalleProveedorProductoMapper } from '../detalleproveedorproducto/mapper/detalle-proveedor-producto.mapper';
import { MarcaMapper } from '../marcas/mapper/marca.mapper';
import { LineaMapper } from '../lineas/mapper/linea.mapper';

// --- MOCK PROVIDERS ---
const mockProductosRepositoryInterface = {};
const mockProductoTypeOrmRepository = {};
const mockDetalleProveedorService = {};
const mockJwtService = {};
const mockUsuarioService = {};
const mockHistorialService = {};
const mockMarcaValidator = {};
const mockLineasValidator = {};
const mockDetalleProveedorMapper = {};
const mockMarcaMapper = {};
const mockLineaMapper = {};

// --- TEST SUITE ---
describe('ProductosModule', () => {
  let module: TestingModule;
  let controller: ProductosController;
  let service: ProductosService;
  let validator: ProductosValidator;
  let mapper: ProductoMapper;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [ProductosController],
      providers: [
        ProductosService,
        ProductosValidator,
        ProductoMapper, // Incluimos el mapper real
        {
          provide: 'IProductosRepository',
          useValue: mockProductosRepositoryInterface,
        },
        {
          provide: getRepositoryToken(Producto),
          useValue: mockProductoTypeOrmRepository,
        },
        {
          provide: DetalleProveedorProductoService,
          useValue: mockDetalleProveedorService,
        },
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
        {
          provide: MarcaValidator,
          useValue: mockMarcaValidator,
        },
        {
          provide: LineasValidator,
          useValue: mockLineasValidator,
        },
        // --- ¡CORRECCIÓN AQUÍ! ---
        // Proveemos los mocks para las dependencias del ProductoMapper
        {
          provide: DetalleProveedorProductoMapper,
          useValue: mockDetalleProveedorMapper,
        },
        {
          provide: MarcaMapper,
          useValue: mockMarcaMapper,
        },
        {
          provide: LineaMapper,
          useValue: mockLineaMapper,
        },
      ],
    }).compile();

    controller = module.get<ProductosController>(ProductosController);
    service = module.get<ProductosService>(ProductosService);
    validator = module.get<ProductosValidator>(ProductosValidator);
    mapper = module.get<ProductoMapper>(ProductoMapper); // <-- Obtenemos la instancia
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería compilar el módulo exitosamente', () => {
    expect(module).toBeDefined();
  });

  it('debería resolver (inyectar) ProductosController', () => {
    expect(controller).toBeDefined();
  });

  it('debería resolver (inyectar) ProductosService', () => {
    expect(service).toBeDefined();
  });

  it('debería resolver (inyectar) ProductosValidator', () => {
    expect(validator).toBeDefined();
  });

  it('debería resolver (inyectar) ProductoMapper', () => {
    expect(mapper).toBeDefined(); // Usamos la variable obtenida en beforeEach
  });

  it('debería resolver (inyectar) IProductosRepository (como mock)', () => {
    const repository = module.get<IProductosRepository>('IProductosRepository');
    expect(repository).toBeDefined();
    expect(repository).toBe(mockProductosRepositoryInterface);
  });

  it('debería inyectar mocks correctamente en el ProductosService', () => {
    expect(service['productosRepository']).toBe(
      mockProductosRepositoryInterface,
    );
    expect(service['historialActividades']).toBe(mockHistorialService);
    expect(service['validator']).toBeInstanceOf(ProductosValidator);
    expect(service['productoMapper']).toBeInstanceOf(ProductoMapper);
  });

  it('debería inyectar mocks correctamente en el ProductosValidator', () => {
    expect(validator['productosService']).toBe(service);
    expect(validator['marcaValidator']).toBe(mockMarcaValidator);
  });

  // Test adicional para verificar las inyecciones del Mapper
  it('debería inyectar mocks correctamente en el ProductoMapper', () => {
    expect(mapper['marcaMapper']).toBe(mockMarcaMapper);
    expect(mapper['lineaMapper']).toBe(mockLineaMapper);
  });
});
