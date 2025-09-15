import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from 'src/app.module';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UsersService } from 'src/users/users.service';


async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);
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

        for (const userData of demoUsers) {
            const existingUser = await usersService.findByEmail(userData.email);
            if (!existingUser) {
                const user = await usersService.create(userData);
                console.log(`Demo user created: ${user.email} (${user.role})`);
            } else {
                console.log(`Demo user already exists: ${userData.email}`);
            }
        }

        console.log('Database seeding completed!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await app.close();
    }
}

seed();