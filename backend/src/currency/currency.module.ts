import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CurrencyRate } from '../common/entities/currency-rate.entity';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([CurrencyRate]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        baseURL: cfg.get('NBP_API_BASE') || 'https://api.nbp.pl/api',
        timeout: parseInt(cfg.get('NBP_API_TIMEOUT') as any, 10) || 5000,
      }),
    }),
  ],
  providers: [CurrencyService],
  exports: [CurrencyService],
  controllers: [CurrencyController],
})
export class CurrencyModule { }
