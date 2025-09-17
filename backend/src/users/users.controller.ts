import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseUUIDPipe, ParseIntPipe, HttpCode, HttpStatus, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from 'src/common/entities/user.entity';
import { UserRole } from 'src/common/enums/user-role.enum';


@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    create(@Body() createUserDto: CreateUserDto, @GetUser() creator: User) {
        return this.usersService.create(createUserDto, creator.id);
    }

    @Get()
    @Roles(UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DISTRIBUTOR)
    findAll(
        @Query('page', new ParseIntPipe({ optional: true })) page?: number,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ) {
        return this.usersService.findAll(page, limit);
    }

    @Get('locked')
    getLockedUsers() {
        return this.usersService.getLockedUsers();
    }

    @Get('activity/all')
    @Roles(UserRole.SUPER_ADMIN)
    getAllActivity(
        @Query('page', new ParseIntPipe({ optional: true })) page?: number,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ) {
        return this.usersService.getAllActivity(page, limit);
    }

    @Get(':id')
    @Roles(UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
        @GetUser() updater: User,
    ) {
        return this.usersService.update(id, updateUserDto, updater.id);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Param('id', ParseUUIDPipe) id: string, @GetUser() deleter: User) {
        return this.usersService.delete(id, deleter.id);
    }

    @Post(':id/unlock')
    @Roles(UserRole.DISTRIBUTOR, UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    unlock(@Param('id', ParseUUIDPipe) id: string, @GetUser() unlocker: User) {
        return this.usersService.unlockAccount(id, unlocker.id);
    }

    @Post(':id/reset-password')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    resetPassword(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() resetPasswordDto: ResetPasswordDto,
        @GetUser() resetter: User,
    ) {
        return this.usersService.resetPassword(id, resetPasswordDto.newPassword, resetter.id);
    }

    @Get(':id/activity')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    getUserActivity(
        @Param('id', ParseUUIDPipe) id: string,
        @Query('page', new ParseIntPipe({ optional: true })) page?: number,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ) {
        return this.usersService.getUserActivity(id, page, limit);
    }
}