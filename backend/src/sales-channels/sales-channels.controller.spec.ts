import { Test, TestingModule } from '@nestjs/testing';
import { SalesChannelsController } from './sales-channels.controller';

describe('SalesChannelsController', () => {
  let controller: SalesChannelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesChannelsController],
    }).compile();

    controller = module.get<SalesChannelsController>(SalesChannelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
