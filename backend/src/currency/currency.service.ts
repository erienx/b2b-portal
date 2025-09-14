import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyRate } from '../common/entities/currency-rate.entity';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(
    @InjectRepository(CurrencyRate)
    private readonly rateRepo: Repository<CurrencyRate>,
    private readonly httpService: HttpService,
  ) {}

  private dateOnly(d: Date) {
    return new Date(d.toISOString().slice(0, 10));
  }


  async getRate(currencyCode: string, date: Date = new Date()): Promise<number> {
    const code = currencyCode.toUpperCase();
    const day = this.dateOnly(date);

    const existing = await this.rateRepo.findOne({
      where: { currency_code: code, rate_date: day },
    });
    if (existing) return Number(existing.rate_to_eur);
    
    if (code === 'EUR') {
      const rec = this.rateRepo.create({
        currency_code: 'EUR',
        rate_date: day,
        rate_to_eur: 1,
        source: 'STATIC',
      });
      await this.rateRepo.save(rec);
      return 1;
    }

    const eurMidPLN = await this.getNbpMidPLN('EUR', day);
    const curMidPLN = code === 'PLN' ? 1 : await this.getNbpMidPLN(code, day);

    const rateToEur = Number((curMidPLN / eurMidPLN).toFixed(6));

    const rec = this.rateRepo.create({
      currency_code: code,
      rate_date: day,
      rate_to_eur: rateToEur,
      source: 'NBP',
    });
    await this.rateRepo.save(rec);
    return rateToEur;
  }


  private async getNbpMidPLN(code: string, date: Date): Promise<number> {
    const dateStr = date.toISOString().slice(0, 10);
    try {
      const resp = await lastValueFrom(
        this.httpService.get(`/exchangerates/rates/A/${code}/${dateStr}/?format=json`),
      );
      return Number(resp.data.rates[0].mid);
    } catch (err) {
      this.logger.warn(`NBP: no rate for ${code} on ${dateStr}, falling back to latest: ${err?.message || err}`);
      try {
        const resp2 = await lastValueFrom(
          this.httpService.get(`/exchangerates/rates/A/${code}/?format=json`),
        );
        return Number(resp2.data.rates[0].mid);
      } catch (err2) {
        this.logger.error(`NBP: failed to fetch latest ${code}`, err2);
        throw new Error(`NBP API unavailable for currency ${code}`);
      }
    }
  }
}
