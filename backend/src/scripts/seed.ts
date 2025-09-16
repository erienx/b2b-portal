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
                email: 'distributor2@demo.com',
                password: 'Distributor123!',
                firstName: 'Jack',
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

            createdUsers[userData.email] = user;
        }

        const distributorRepo = dataSource.getRepository(Distributor);
        const assignmentRepo = dataSource.getRepository(UserDistributorAssignment);

        const existingDistributor1 = await distributorRepo.findOne({
            where: { company_name: 'Demo Distributor 1' },
            relations: ['exportManager'],
        });

        if (!existingDistributor1) {
            const distributor1 = distributorRepo.create({
                company_name: 'Demo Distributor 1',
                country: 'PL',
                currency: 'PLN',
                exportManager: createdUsers['exportmanager@demo.com'],
            });

            await distributorRepo.save(distributor1);
            console.log('Distributor created:', distributor1.company_name);

            const assignment1 = assignmentRepo.create({
                distributor: distributor1,
                user: createdUsers['distributor@demo.com'],
            });

            await assignmentRepo.save(assignment1);
            console.log('User assigned to distributor:', createdUsers['distributor@demo.com'].email);
        } else {
            console.log('Distributor already exists:', existingDistributor1.company_name);
        }

        // --- NEW DISTRIBUTOR 2 ---
        const existingDistributor2 = await distributorRepo.findOne({
            where: { company_name: 'Demo Distributor 2' },
            relations: ['exportManager'],
        });

        if (!existingDistributor2) {
            const distributor2 = distributorRepo.create({
                company_name: 'Demo Distributor 2',
                country: 'PL',
                currency: 'PLN',
                exportManager: createdUsers['exportmanager@demo.com'],
            });

            await distributorRepo.save(distributor2);
            console.log('Distributor created:', distributor2.company_name);

            const assignment2 = assignmentRepo.create({
                distributor: distributor2,
                user: createdUsers['distributor2@demo.com'],
            });

            await assignmentRepo.save(assignment2);
            console.log('User assigned to distributor:', createdUsers['distributor2@demo.com'].email);
        } else {
            console.log('Distributor already exists:', existingDistributor2.company_name);
        }

        console.log('Database seeding completed!');
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        await app.close();
    }
}

seed();
