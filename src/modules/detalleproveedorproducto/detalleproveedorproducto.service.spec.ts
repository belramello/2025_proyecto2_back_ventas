import { Test, TestingModule } from '@nestjs/testing';
import { DetalleproveedorproductoService } from './detalleproveedorproducto.service';

describe('DetalleproveedorproductoService', () => {
  let service: DetalleproveedorproductoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleproveedorproductoService],
    }).compile();

    service = module.get<DetalleproveedorproductoService>(DetalleproveedorproductoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
