import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MediaFile } from 'src/common/entities/media-file.entity';
import { UserActivityLog } from 'src/common/entities/user-activity-log.entity';
import { UserDistributorAssignment } from 'src/common/entities/user-distributor-assignment.entity';
import { User } from 'src/common/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserActivityLog,
      UserDistributorAssignment,
      MediaFile,
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}