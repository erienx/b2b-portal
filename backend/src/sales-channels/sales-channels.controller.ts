import { Controller, Post, Body, UseGuards, Get, Query, UseInterceptors, UploadedFile, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SalesChannelsService } from './sales-channels.service';
import { CreateSalesClientDto, CreateSalesReportDto, CreateSkuReportDto } from './dto/create-sales-report.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../common/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('sales-channels')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SalesChannelsController {
    constructor(private readonly salesService: SalesChannelsService) { }

    @Post()
    @Roles(UserRole.DISTRIBUTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXPORT_MANAGER)
    createOrUpdate(@Body() dto: CreateSalesReportDto, @GetUser() user: User) {
        let distributorId: string | undefined = dto.distributorId;
        return this.salesService.createOrUpdate(distributorId, dto, user);
    }

    @Post('import')
    @Roles(UserRole.DISTRIBUTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXPORT_MANAGER)
    @UseInterceptors(FileInterceptor('file'))
    importCsv(@UploadedFile() file: Express.Multer.File, @GetUser() user: User) {
        return this.salesService.importCsv(file.buffer, user);
    }

    @Get('fetch')
    @Roles(UserRole.DISTRIBUTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXPORT_MANAGER)
    async fetchReport(
        @Query('year') year: number,
        @Query('quarter') quarter: number,
        @Query('distributorId') distributorId: string,
        @GetUser() user: User
    ) {
        let targetDistributorId: string | undefined;

        if ([UserRole.DISTRIBUTOR, UserRole.EMPLOYEE].includes(user.role)) {
            const assignment = await this.salesService.getAssignedDistributor(user);
            if (!assignment) throw new NotFoundException('No distributor assigned to current user');
            targetDistributorId = assignment.id;
        } else {
            targetDistributorId = distributorId;
        }

        return this.salesService.findForYearQuarter(targetDistributorId, Number(year), Number(quarter));
    }


    @Get()
    @Roles(UserRole.DISTRIBUTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXPORT_MANAGER)
    findAll(@GetUser() user: User) {
        return this.salesService.findAllForUser(user);
    }

    @Post('clients')
    @Roles(UserRole.DISTRIBUTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXPORT_MANAGER)
    addClient(@Body() dto: CreateSalesClientDto, @GetUser() user: User) {
        return this.salesService.addClient(dto, user);
    }

    @Post('sku')
    @Roles(UserRole.DISTRIBUTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXPORT_MANAGER)
    addSku(@Body() dto: CreateSkuReportDto, @GetUser() user: User) {
        return this.salesService.addSkuReport(dto, user);
    }
}
