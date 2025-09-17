import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { DistributorsService } from './distributors.service';
import type { Request } from 'express';
import { User } from 'src/common/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { CreateDistributorDto } from './dto/create-distributor.dto';

@Controller('distributors')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DistributorsController {
    constructor(private readonly distributorsService: DistributorsService) { }

    @Get()
    async getDistributors(@GetUser() user: User) {
        return this.distributorsService.getDistributorsForUser(user);
    }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async createDistributor(
        @Body() createDistributorDto: CreateDistributorDto,
        @GetUser() creator: User,
    ) {
        return this.distributorsService.create(createDistributorDto, creator.id);
    }

    @Get('export-managers')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getExportManagers() {
        return this.distributorsService.getExportManagers();
    }
}