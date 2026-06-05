import { Test, TestingModule } from '@nestjs/testing';
import { SytemConfigController } from './sytem-config.controller';
import { SytemConfigService } from './sytem-config.service';

describe('SytemConfigController', () => {
  let controller: SytemConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SytemConfigController],
      providers: [SytemConfigService],
    }).compile();

    controller = module.get<SytemConfigController>(SytemConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
