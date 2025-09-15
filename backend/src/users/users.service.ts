import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserActivityLog } from 'src/common/entities/user-activity-log.entity';
import { User } from 'src/common/entities/user.entity';
import { UserAction } from 'src/common/enums/user-action.enum';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserActivityLog)
        private readonly activityLogRepository: Repository<UserActivityLog>,
    ) { }

    async create(createUserDto: CreateUserDto, creatorId?: string): Promise<User> {
        const { email, password, firstName, lastName, role } = createUserDto;

        const existingUser = await this.userRepository.findOne({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        this.validatePassword(password);

        const passwordHash = await argon2.hash(password);

        const user = this.userRepository.create({
            email: email.toLowerCase(),
            password_hash: passwordHash,
            first_name: firstName,
            last_name: lastName,
            role: role || UserRole.EMPLOYEE,
            must_change_password: true,
            failed_login_attempts: 0,
            is_locked: false,
            is_active: true,
        });

        const savedUser = await this.userRepository.save(user);

        if (creatorId) {
            await this.logUserActivity(
                creatorId,
                UserAction.LOGIN,
                `Created user: ${savedUser.email}`,
            );
        }

        return this.sanitizeUser(savedUser);
    }

    async findAll(page: number = 1, limit: number = 50): Promise<{
        users: User[];
        total: number;
        totalPages: number;
    }> {
        const [users, total] = await this.userRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' },
            relations: ['assignments', 'managedDistributors'],
        });

        return {
            users: users.map(user => this.sanitizeUser(user)),
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['assignments', 'managedDistributors'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.sanitizeUser(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { email: email.toLowerCase() },
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto, updaterId?: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateUserDto.email.toLowerCase() },
            });

            if (existingUser) {
                throw new ConflictException('User with this email already exists');
            }
        }

        const updateData: Partial<User> = {};

        if (updateUserDto.email) {
            updateData.email = updateUserDto.email.toLowerCase();
        }

        if (updateUserDto.firstName) {
            updateData.first_name = updateUserDto.firstName;
        }

        if (updateUserDto.lastName) {
            updateData.last_name = updateUserDto.lastName;
        }

        if (updateUserDto.role) {
            updateData.role = updateUserDto.role;
        }

        if (updateUserDto.isActive !== undefined) {
            updateData.is_active = updateUserDto.isActive;
        }

        await this.userRepository.update(id, updateData);

        if (updaterId) {
            await this.logUserActivity(
                updaterId,
                UserAction.LOGIN,
                `Updated user: ${user.email}`,
            );
        }

        return this.findOne(id);
    }

    async delete(id: string, deleterId?: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role === UserRole.SUPER_ADMIN) {
            const superAdminCount = await this.userRepository.count({
                where: { role: UserRole.SUPER_ADMIN, is_active: true },
            });

            if (superAdminCount <= 1) {
                throw new ForbiddenException('Cannot delete the last super admin');
            }
        }

        await this.userRepository.delete(id);

        if (deleterId) {
            await this.logUserActivity(
                deleterId,
                UserAction.LOGIN,
                `Deleted user: ${user.email}`,
            );
        }
    }

    async unlockAccount(id: string, unlockerId: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.is_locked) {
            throw new BadRequestException('Account is not locked');
        }

        await this.userRepository.update(id, {
            is_locked: false,
            failed_login_attempts: 0,
        });

        await this.logUserActivity(
            unlockerId,
            UserAction.LOGIN,
            `Unlocked account: ${user.email}`,
        );
    }

    async resetPassword(id: string, newPassword: string, reseterId: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        this.validatePassword(newPassword);

        const passwordHash = await argon2.hash(newPassword);

        await this.userRepository.update(id, {
            password_hash: passwordHash,
            password_changed_at: new Date(),
            must_change_password: true,
        });

        await this.logUserActivity(
            reseterId,
            UserAction.LOGIN,
            `Reset password for user: ${user.email}`,
        );
    }

    async getUserActivity(userId: string, page: number = 1, limit: number = 50): Promise<{
        logs: UserActivityLog[];
        total: number;
        totalPages: number;
    }> {
        const [logs, total] = await this.activityLogRepository.findAndCount({
            where: { user: { id: userId } },
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            logs,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    private validatePassword(password: string): void {
        if (password.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters long');
        }

        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasDigit = /\d/.test(password);

        if (!hasSpecialChar) {
            throw new BadRequestException('Password must contain at least one special character');
        }

        if (!hasDigit) {
            throw new BadRequestException('Password must contain at least one digit');
        }
    }

    private sanitizeUser(user: User): User {
        const { password_hash, ...sanitizedUser } = user;
        return sanitizedUser as User;
    }

    private async logUserActivity(
        userId: string,
        action: UserAction,
        details: Record<string, any> | string,
    ): Promise<void> {
        const log = this.activityLogRepository.create({
            user: { id: userId } as User,
            action,
            details: typeof details === 'string' ? { message: details } : details,
        });

        await this.activityLogRepository.save(log);
    }
}