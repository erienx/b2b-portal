import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivityLog } from 'src/common/entities/user-activity-log.entity';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { User } from 'src/common/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserActivityLog, User])],
  providers: [LogsService],
  controllers: [LogsController],
})
export class LogsModule { }
