import { Test, TestingModule } from '@nestjs/testing';
import { DetalleVentasService } from './detalle-ventas.service';

describe('DetalleVentasService', () => {
  let service: DetalleVentasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleVentasService],
    }).compile();

    service = module.get<DetalleVentasService>(DetalleVentasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
