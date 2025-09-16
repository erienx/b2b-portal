import { Module } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { Distributor } from 'src/common/entities/distributor.entity';
import { User } from 'src/common/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportManagerSubstitution } from 'src/common/entities/export-manager-substitution.entity';
import { SalesChannelsReport } from 'src/common/entities/sales-channels-report.entity';
import { PurchaseReport } from 'src/common/entities/purchase-report.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Distributor,
            User,
            ExportManagerSubstitution,
            SalesChannelsReport,
            PurchaseReport,
        ]),
    ],
    controllers: [ExportsController],
    providers: [ExportsService],
    exports: [ExportsService],
})
export class ExportsModule { }
