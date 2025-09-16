import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseReportsService } from './purchase-reports.service';

describe('PurchaseReportsService', () => {
  let service: PurchaseReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PurchaseReportsService],
    }).compile();

    service = module.get<PurchaseReportsService>(PurchaseReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
