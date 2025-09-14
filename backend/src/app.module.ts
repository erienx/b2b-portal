import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DistributorsModule } from './distributors/distributors.module';
import { SalesChannelsModule } from './sales-channels/sales-channels.module';
import { PurchaseReportsModule } from './purchase-reports/purchase-reports.module';
import { MediaModule } from './media/media.module';
import { AdminModule } from './admin/admin.module';
import { ExportsModule } from './exports/exports.module';
import { CurrencyModule } from './currency/currency.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ ttl: 60 * 60 }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DATABASE_HOST'),
        port: +cfg.get('DATABASE_PORT'),
        username: cfg.get('DATABASE_USER'),
        password: cfg.get('DATABASE_PASSWORD'),
        database: cfg.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // set to false in production
        logging: true,
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }]),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
