import { Test, TestingModule } from '@nestjs/testing';
import { DetalleproveedorproductoController } from './detalleproveedorproducto.controller';
import { DetalleproveedorproductoService } from './detalleproveedorproducto.service';

describe('DetalleproveedorproductoController', () => {
  let controller: DetalleproveedorproductoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleproveedorproductoController],
      providers: [DetalleproveedorproductoService],
    }).compile();

    controller = module.get<DetalleproveedorproductoController>(DetalleproveedorproductoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
