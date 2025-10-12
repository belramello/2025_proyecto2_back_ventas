import { Test, TestingModule } from '@nestjs/testing';
import { ProductosModule } from './productos.module';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { ProductosRepository } from './repository/producto.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Repository } from 'typeorm';

// Mock del Repository de TypeORM
// Necesitamos un mock para anular la dependencia inyectada por TypeORM
const mockTypeOrmRepository: Partial<Repository<Producto>> = {}; 

describe('ProductosModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      // 1. Cargamos el módulo real completo:
      // Esto es crucial para que Istanbul (el analizador de cobertura) 
      // registre la ejecución del decorador @Module y sus líneas internas.
      imports: [ProductosModule], 
      // Los 'imports', 'controllers' y 'providers' del módulo real serán analizados aquí.
    })
    // 2. Sobrescribimos la inyección del Repository (que ProductosRepository necesita).
    // Esto previene el error de "Cannot resolve DataSource" sin dejar de usar el módulo real.
    .overrideProvider(getRepositoryToken(Producto))
    .useValue(mockTypeOrmRepository)
    .compile();
  });

  it('debe compilar y definir el módulo de productos correctamente (Cubre el 100% de productos.module.ts)', () => {
    // La simple ejecución de la compilación anterior es suficiente para la cobertura de líneas.
    expect(module).toBeDefined();
  });

  it('debe inyectar ProductosController', () => {
    const controller = module.get(ProductosController);
    expect(controller).toBeInstanceOf(ProductosController);
  });
  
  it('debe inyectar ProductosService', () => {
    const service = module.get(ProductosService);
    expect(service).toBeInstanceOf(ProductosService);
  });
  
  it('debe inyectar IProductosRepository con ProductosRepository', () => {
    const repository = module.get('IProductosRepository');
    expect(repository).toBeInstanceOf(ProductosRepository);
  });
});