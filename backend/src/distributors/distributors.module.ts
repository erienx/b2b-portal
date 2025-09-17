import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributorsController } from './distributors.controller';
import { DistributorsService } from './distributors.service';
import { Distributor } from 'src/common/entities/distributor.entity';
import { ExportManagerSubstitution } from 'src/common/entities/export-manager-substitution.entity';
import { User } from 'src/common/entities/user.entity';
import { UserDistributorAssignment } from 'src/common/entities/user-distributor-assignment.entity';
import { UserActivityLog } from 'src/common/entities/user-activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Distributor, ExportManagerSubstitution, User, UserDistributorAssignment, UserActivityLog])],
  controllers: [DistributorsController],
  providers: [DistributorsService],
  exports: [DistributorsService],
})
export class DistributorsModule { }
