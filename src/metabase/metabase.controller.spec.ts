import { Test, TestingModule } from '@nestjs/testing';
import { MetabaseController } from './metabase.controller';
import { MetabaseService } from './metabase.service';

describe('MetabaseController', () => {
  let controller: MetabaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetabaseController],
      providers: [MetabaseService],
    }).compile();

    controller = module.get<MetabaseController>(MetabaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
