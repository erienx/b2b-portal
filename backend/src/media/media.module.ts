import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaFile } from '../common/entities/media-file.entity';
import { MediaCategory } from '../common/entities/media-category.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaFile, MediaCategory]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadPath = config.get<string>('MEDIA_UPLOAD_PATH') || './uploads/media';
            cb(null, uploadPath);
          },
          filename: (req, file, cb) => {
            const random = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${random}${extname(file.originalname)}`);
          },
        }),
        limits: { fileSize: Number(config.get('MEDIA_MAX_FILE_SIZE') || 50 * 1024 * 1024) }, // domyślnie 50MB
      }),
    }),
  ],
  providers: [MediaService],
  controllers: [MediaController],
})
export class MediaModule { }
