import { Test, TestingModule } from '@nestjs/testing';
import { PermisosService } from './permisos.service';

describe('PermisosService', () => {
  let service: PermisosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermisosService],
    }).compile();

    service = module.get<PermisosService>(PermisosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
