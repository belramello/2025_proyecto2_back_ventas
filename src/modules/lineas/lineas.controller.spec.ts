import { Test, TestingModule } from '@nestjs/testing';
import { LineasController } from './lineas.controller';
import { LineasService } from './lineas.service';

describe('LineasController', () => {
  let controller: LineasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LineasController],
      providers: [LineasService],
    }).compile();

    controller = module.get<LineasController>(LineasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
