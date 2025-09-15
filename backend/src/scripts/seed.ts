import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from 'src/app.module';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UsersService } from 'src/users/users.service';
import { DataSource } from 'typeorm';
import { Distributor } from 'src/common/entities/distributor.entity';
import { UserDistributorAssignment } from 'src/common/entities/user-distributor-assignment.entity';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);
    const dataSource = app.get(DataSource);
    const configService = app.get(ConfigService);

    try {
        const existingSuperAdmin = await usersService.findByEmail('admin@b2bportal.com');
        if (!existingSuperAdmin) {
            const superAdmin = await usersService.create({
                email: 'admin@b2bportal.com',
                password: 'Admin123!',
                firstName: 'Super',
                lastName: 'Admin',
                role: UserRole.SUPER_ADMIN,
            });
            console.log('Super admin created successfully:', superAdmin.email);
        } else {
            console.log('Super admin already exists');
        }

        const demoUsers = [
            {
                email: 'employee@demo.com',
                password: 'Employee123!',
                firstName: 'John',
                lastName: 'Employee',
                role: UserRole.EMPLOYEE,
            },
            {
                email: 'distributor@demo.com',
                password: 'Distributor123!',
                firstName: 'Jane',
                lastName: 'Distributor',
                role: UserRole.DISTRIBUTOR,
            },
            {
                email: 'exportmanager@demo.com',
                password: 'Manager123!',
                firstName: 'Mike',
                lastName: 'Manager',
                role: UserRole.EXPORT_MANAGER,
            },
            {
                email: 'admin@demo.com',
                password: 'Admin123!',
                firstName: 'Alice',
                lastName: 'Admin',
                role: UserRole.ADMIN,
            },
        ];

        const createdUsers = {};

        for (const userData of demoUsers) {
            let user = await usersService.findByEmail(userData.email);

            if (!user) {
                user = await usersService.create(userData);
                console.log(`Demo user created: ${user.email} (${user.role})`);
            } else {
                console.log(`Demo user already exists: ${userData.email}`);
            }

            createdUsers[userData.role] = user;
        }

        const distributorRepo = dataSource.getRepository(Distributor);
        const assignmentRepo = dataSource.getRepository(UserDistributorAssignment);

        const existingDistributor = await distributorRepo.findOne({
            where: {
                company_name: 'Demo Distributor 1',
            },
            relations: ['exportManager'],
        });

        if (!existingDistributor) {
            const distributor = distributorRepo.create({
                company_name: 'Demo Distributor 1',
                country: 'PL',
                currency: 'PLN',
                exportManager: createdUsers[UserRole.EXPORT_MANAGER],
            });

            await distributorRepo.save(distributor);
            console.log('Distributor created:', distributor.company_name);

            const assignment = assignmentRepo.create({
                distributor,
                user: createdUsers[UserRole.DISTRIBUTOR],
            });

            await assignmentRepo.save(assignment);
            console.log('User assigned to distributor:', createdUsers[UserRole.DISTRIBUTOR].email);
        } else {
            console.log('Distributor already exists:', existingDistributor.company_name);
        }

        console.log('Database seeding completed!');
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        await app.close();
    }
}

seed();
