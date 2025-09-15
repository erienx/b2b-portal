import { Injectable } from '@nestjs/common';


@Injectable()
export class AppService {
  getHello(): string {
    return 'B2B Portal API v1.0 - Welcome!';
  }
}