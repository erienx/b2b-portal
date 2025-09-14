import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) { }

  @Get('rate')
  async getRate(@Query('code') code?: string) {
    if (!code) {
      throw new BadRequestException('Query parameter "code" is required. Example: /rate?code=PLN');
    }
    const normalized = code.toUpperCase();
    const rate = await this.currencyService.getRate(normalized);
    return { code: normalized, rate };
  }
}