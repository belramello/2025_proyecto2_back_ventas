import { Test, TestingModule } from '@nestjs/testing';
import { MetabaseService } from './metabase.service';

describe('MetabaseService', () => {
  let service: MetabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetabaseService],
    }).compile();

    service = module.get<MetabaseService>(MetabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
