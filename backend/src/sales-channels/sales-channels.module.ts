import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesChannelsService } from './sales-channels.service';
import { SalesChannelsController } from './sales-channels.controller';
import { SalesChannelsReport } from '../common/entities/sales-channels-report.entity';
import { Distributor } from '../common/entities/distributor.entity';
import { CurrencyModule } from '../currency/currency.module';
import { SalesChannelsClient } from 'src/common/entities/sales-channels-client.entity';
import { SalesChannelsSkuReport } from 'src/common/entities/sales-channels-sku-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalesChannelsReport, Distributor, SalesChannelsClient, SalesChannelsSkuReport]),
    CurrencyModule,
  ],
  providers: [SalesChannelsService],
  controllers: [SalesChannelsController],
})
export class SalesChannelsModule { }