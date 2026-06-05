import { Test, TestingModule } from '@nestjs/testing';
import { SytemConfigService } from './sytem-config.service';

describe('SytemConfigService', () => {
  let service: SytemConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SytemConfigService],
    }).compile();

    service = module.get<SytemConfigService>(SytemConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
