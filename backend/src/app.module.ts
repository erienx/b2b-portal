import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DistributorsModule } from './distributors/distributors.module';
import { SalesChannelsModule } from './sales-channels/sales-channels.module';
import { PurchaseReportsModule } from './purchase-reports/purchase-reports.module';
import { MediaModule } from './media/media.module';
import { AdminModule } from './admin/admin.module';
import { ExportsModule } from './exports/exports.module';
import { CurrencyModule } from './currency/currency.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    CacheModule.register({
      ttl: 60 * 60, // 1h
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),

        entities: [__dirname + '/**/*.entity{.ts,.js}'],

        synchronize: config.get<string>('NODE_ENV') === 'development',
        logging: config.get<string>('NODE_ENV') === 'development',
        ssl: config.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'media'),
      serveRoot: '/media',
    }),

    AuthModule,
    UsersModule,
    DistributorsModule,
    SalesChannelsModule,
    PurchaseReportsModule,
    MediaModule,
    AdminModule,
    ExportsModule,
    CurrencyModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
