import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributorsController } from './distributors.controller';
import { DistributorsService } from './distributors.service';
import { Distributor } from 'src/common/entities/distributor.entity';
import { ExportManagerSubstitution } from 'src/common/entities/export-manager-substitution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Distributor, ExportManagerSubstitution])],
  controllers: [DistributorsController],
  providers: [DistributorsService],
  exports: [DistributorsService],
})
export class DistributorsModule { }
