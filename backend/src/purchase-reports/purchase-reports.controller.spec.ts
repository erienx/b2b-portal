import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseReportsController } from './purchase-reports.controller';

describe('PurchaseReportsController', () => {
  let controller: PurchaseReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseReportsController],
    }).compile();

    controller = module.get<PurchaseReportsController>(PurchaseReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
