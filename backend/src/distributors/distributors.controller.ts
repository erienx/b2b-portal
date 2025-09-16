import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DistributorsService } from './distributors.service';
import type { Request } from 'express';
import { User } from 'src/common/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('distributors')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DistributorsController {
    constructor(private readonly distributorsService: DistributorsService) { }

    @Get()
    async getDistributors(@Req() req: Request) {
        const user = req.user as User;
        return this.distributorsService.getDistributorsForUser(user);
    }
}
