import { Test, TestingModule } from '@nestjs/testing';
import { MarcasController } from './marcas.controller';

describe('MarcasController', () => {
  let controller: MarcasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarcasController],
    }).compile();

    controller = module.get<MarcasController>(MarcasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
