// Testing Unitario para App Module
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let appModule: TestingModule;

  beforeAll(async () => {
    appModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(appModule).toBeDefined();
  });

  it('should have AppController', () => {
    const appController = appModule.get<AppController>(AppController);
    expect(appController).toBeDefined();
  });

  it('should have AppService', () => {
    const appService = appModule.get<AppService>(AppService);
    expect(appService).toBeDefined();
  });
});
