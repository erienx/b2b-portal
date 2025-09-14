import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';

import { User } from '../common/entities/user.entity';
import { Distributor } from '../common/entities/distributor.entity';
import { UserDistributorAssignment } from '../common/entities/user-distributor-assignment.entity';
import { SalesChannelsReport } from '../common/entities/sales-channels-report.entity';
import { PurchaseReport } from '../common/entities/purchase-report.entity';
import { MediaCategory } from '../common/entities/media-category.entity';
import { MediaFile } from '../common/entities/media-file.entity';
import { UserActivityLog } from '../common/entities/user-activity-log.entity';
import { CurrencyRate } from '../common/entities/currency-rate.entity';
import { ExportManagerSubstitution } from '../common/entities/export-manager-substitution.entity';
import { UserRole } from '../common/enums/user-role.enum';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'b2b_portal',
    entities: [
        User,
        Distributor,
        UserDistributorAssignment,
        SalesChannelsReport,
        PurchaseReport,
        MediaCategory,
        MediaFile,
        UserActivityLog,
        CurrencyRate,
        ExportManagerSubstitution,
    ],
    synchronize: false,
});

async function seed() {
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);

    const exists = await userRepo.findOne({ where: { email: 'admin@company.com' } });
    if (exists) {
        console.log('SuperAdmin already exists');
        await AppDataSource.destroy();
        return;
    }

    const hashedPassword = await argon2.hash('ChangeMe123!');

    const superAdmin = userRepo.create({
        email: 'admin@company.com',
        password_hash: hashedPassword,
        first_name: 'Super',
        last_name: 'Admin',
        role: UserRole.SUPER_ADMIN,
        is_active: true,
        must_change_password: true,
    });

    await userRepo.save(superAdmin);
    console.log('✅ SuperAdmin created: admin@company.com / ChangeMe123!');

    await AppDataSource.destroy();
}

seed().catch((err) => {
    console.error('Error seeding SuperAdmin:', err);
    process.exit(1);
});
