import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesChannelsService } from './sales-channels.service';
import { SalesChannelsController } from './sales-channels.controller';
import { SalesChannelsReport } from '../common/entities/sales-channels-report.entity';
import { Distributor } from '../common/entities/distributor.entity';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalesChannelsReport, Distributor]),
    CurrencyModule,
  ],
  providers: [SalesChannelsService],
  controllers: [SalesChannelsController],
})
export class SalesChannelsModule { }
