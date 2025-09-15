import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, ConflictException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { JwtPayload, TokenResponse, AuthResponse } from './interfaces/auth.interface';
import { User } from 'src/common/entities/user.entity';
import { UserAction } from 'src/common/enums/user-action.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserActivityLog } from 'src/common/entities/user-activity-log.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserActivityLog)
        private readonly activityLogRepository: Repository<UserActivityLog>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        const { email, password, firstName, lastName, role } = registerDto;

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
            password_changed_at: new Date(),
            must_change_password: false,
        });

        const savedUser = await this.userRepository.save(user);

        await this.logUserActivity(savedUser.id, UserAction.LOGIN, 'User registered');
        const tokens = await this.generateTokens(savedUser);

        return {
            user: this.sanitizeUser(savedUser),
            ...tokens,
        };
    }

    async login(loginDto: LoginDto): Promise<AuthResponse> {
        const { email, password } = loginDto;

        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.is_active) {
            throw new ForbiddenException('Account is deactivated');
        }

        if (user.is_locked) {
            throw new ForbiddenException('Account is locked due to multiple failed login attempts');
        }

        const isPasswordValid = await argon2.verify(user.password_hash, password);

        if (!isPasswordValid) {
            await this.handleFailedLogin(user);
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.failed_login_attempts > 0) {
            await this.userRepository.update(user.id, {
                failed_login_attempts: 0,
            });
        }

        await this.logUserActivity(user.id, UserAction.LOGIN, 'Successful login');

        const tokens = await this.generateTokens(user);

        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }

    async refreshToken(userId: string): Promise<TokenResponse> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user || !user.is_active) {
            throw new UnauthorizedException('User not found or inactive');
        }

        return this.generateTokens(user);
    }

    async getProfile(userId: string): Promise<Partial<User>> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['assignments', 'managedDistributors'],
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return this.sanitizeUser(user);
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const { currentPassword, newPassword } = changePasswordDto;

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isCurrentPasswordValid = await argon2.verify(user.password_hash, currentPassword);
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        this.validatePassword(newPassword);

        const newPasswordHash = await argon2.hash(newPassword);

        await this.userRepository.update(userId, {
            password_hash: newPasswordHash,
            password_changed_at: new Date(),
            must_change_password: false,
        });

        await this.logUserActivity(userId, UserAction.LOGIN, 'Password changed');
    }

    async logout(userId: string): Promise<void> {
        await this.logUserActivity(userId, UserAction.LOGOUT, 'User logged out');
    }

    private async generateTokens(user: User): Promise<TokenResponse> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    private async handleFailedLogin(user: User): Promise<void> {
        const failedAttempts = user.failed_login_attempts + 1;
        const updateData: Partial<User> = { failed_login_attempts: failedAttempts };

        if (failedAttempts >= 3) {
            updateData.is_locked = true;
        }

        await this.userRepository.update(user.id, updateData);

        await this.logUserActivity(
            user.id,
            UserAction.LOGIN,
            `Failed login attempt (${failedAttempts}/3)`,
        );
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

    private sanitizeUser(user: User): Partial<User> {
        const { password_hash, ...sanitizedUser } = user;
        return sanitizedUser;
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