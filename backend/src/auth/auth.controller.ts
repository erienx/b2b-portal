import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus, Res, } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { User } from 'src/common/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(
        @Body() registerDto: RegisterDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const result = await this.authService.register(registerDto);

        response.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
        });

        return {
            user: result.user,
            accessToken: result.accessToken,
        };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const result = await this.authService.login(loginDto);

        response.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, //7d
        });

        return {
            user: result.user,
            accessToken: result.accessToken,
        };
    }

    @Post('refresh')
    @UseGuards(AuthGuard('jwt-refresh'))
    @HttpCode(HttpStatus.OK)
    async refresh(@GetUser() user: User) {
        const tokens = await this.authService.refreshToken(user.id);

        return {
            accessToken: tokens.accessToken,
        };
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@GetUser() user: User) {
        return this.authService.getProfile(user.id);
    }

    @Post('change-password')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async changePassword(
        @GetUser() user: User,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        await this.authService.changePassword(user.id, changePasswordDto);
        return { message: 'Password changed successfully' };
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async logout(
        @GetUser() user: User,
        @Res({ passthrough: true }) response: Response,
    ) {
        await this.authService.logout(user.id);

        response.clearCookie('refreshToken');

        return { message: 'Logged out successfully' };
    }
}