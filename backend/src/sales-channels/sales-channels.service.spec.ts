import { Test, TestingModule } from '@nestjs/testing';
import { SalesChannelsService } from './sales-channels.service';

describe('SalesChannelsService', () => {
  let service: SalesChannelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesChannelsService],
    }).compile();

    service = module.get<SalesChannelsService>(SalesChannelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
