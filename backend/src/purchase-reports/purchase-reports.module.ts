import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseReportsController } from './purchase-reports.controller';
import { PurchaseReportsService } from './purchase-reports.service';
import { PurchaseReport } from '../common/entities/purchase-report.entity';
import { Distributor } from '../common/entities/distributor.entity';
import { SalesChannelsReport } from '../common/entities/sales-channels-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseReport, Distributor, SalesChannelsReport]),
  ],
  providers: [PurchaseReportsService],
  controllers: [PurchaseReportsController],
  exports: [PurchaseReportsService],
})
export class PurchaseReportsModule { }