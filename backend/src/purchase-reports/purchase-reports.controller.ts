import { Controller, Post, Body, UseGuards, Get, Query, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PurchaseReportsService } from './purchase-reports.service';
import { CreatePurchaseReportDto } from './dto/create-purchase-report.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../common/entities/user.entity';

@Controller('purchase-reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PurchaseReportsController {
    constructor(private readonly purchaseService: PurchaseReportsService) { }

    @Post()
    @Roles(UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    createOrUpdate(@Body() dto: CreatePurchaseReportDto, @GetUser() user: User) {
        let distributorId: string | undefined = dto.distributorId;
        return this.purchaseService.createOrUpdate(distributorId, dto, user);
    }

    @Get('fetch')
    @Roles(UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async fetchReport(
        @Query('year') year: number,
        @Query('quarter') quarter: number,
        @Query('distributorId') distributorId: string,
        @GetUser() user: User
    ) {
        let targetDistributorId: string | undefined;

        if (user.role === UserRole.EXPORT_MANAGER) {
            const isAssigned = await this.purchaseService.isDistributorAssignedToManager(distributorId, user.id);
            if (!isAssigned) {
                throw new NotFoundException('Distributor not assigned to current export manager');
            }
            targetDistributorId = distributorId;
        } else {
            targetDistributorId = distributorId;
        }

        if (!targetDistributorId) {
            throw new NotFoundException('Distributor ID required');
        }

        return this.purchaseService.findForYearQuarter(targetDistributorId, Number(year), Number(quarter));
    }

    @Get()
    @Roles(UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    findAll(@GetUser() user: User) {
        return this.purchaseService.findAllForUser(user);
    }

    @Get('dashboard')
    @Roles(UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getDashboard(
        @Query('distributorId') distributorId: string,
        @Query('year') year: number,
        @GetUser() user: User
    ) {
        if (!distributorId) {
            throw new NotFoundException('Distributor ID required');
        }

        if (user.role === UserRole.EXPORT_MANAGER) {
            const isAssigned = await this.purchaseService.isDistributorAssignedToManager(distributorId, user.id);
            if (!isAssigned) {
                throw new NotFoundException('Distributor not assigned to current export manager');
            }
        }

        return this.purchaseService.getDashboardData(distributorId, Number(year) || new Date().getFullYear());
    }

    @Get('debug/:distributorId/:year/:quarter')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async debug(
        @Query('distributorId') distributorId: string,
        @Query('year') year: string,
        @Query('quarter') quarter: string
    ) {
        return this.purchaseService.debugSalesData(distributorId, Number(year), Number(quarter));
    }
}