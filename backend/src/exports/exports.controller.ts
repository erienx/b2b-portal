import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
    Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExportsService } from './exports.service';
import { CreateSubstitutionDto } from './dto/create-substitution.dto';
import { UpdateSubstitutionDto } from './dto/update-substitution.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from 'src/common/entities/user.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import type { Response } from 'express';

@Controller('export-manager')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ExportsController {
    constructor(private readonly exportManagerService: ExportsService) { }

    @Get('distributors-overview')
    @Roles(UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getDistributorsOverview(
        @GetUser() currentUser: User,
        @Query('country') country?: string,
        @Query('distributorId') distributorId?: string,
    ) {
        return this.exportManagerService.getDistributorsOverview(currentUser, country, distributorId);
    }

    @Get('countries')
    @Roles(UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getAvailableCountries(@GetUser() currentUser: User) {
        return this.exportManagerService.getAvailableCountries(currentUser);
    }

    @Get('export-managers')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getExportManagers() {
        return this.exportManagerService.getExportManagers();
    }

    @Post('substitutions')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async createSubstitution(
        @Body() createSubstitutionDto: CreateSubstitutionDto,
        @GetUser() currentUser: User,
    ) {
        return this.exportManagerService.createSubstitution(createSubstitutionDto, currentUser);
    }

    @Get('substitutions')
    @Roles(UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getSubstitutions(@GetUser() currentUser: User) {
        return this.exportManagerService.getSubstitutions(currentUser);
    }

    @Get('substitutions/:id')
    @Roles(UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getSubstitution(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser() currentUser: User,
    ) {
        return this.exportManagerService.getSubstitution(id, currentUser);
    }

    @Patch('substitutions/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async updateSubstitution(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateSubstitutionDto: UpdateSubstitutionDto,
        @GetUser() currentUser: User,
    ) {
        return this.exportManagerService.updateSubstitution(id, updateSubstitutionDto, currentUser);
    }

    @Delete('substitutions/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deactivateSubstitution(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser() currentUser: User,
    ) {
        return this.exportManagerService.deactivateSubstitution(id, currentUser);
    }


    @Get('csv/full')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async exportFullCsv(
        @GetUser() currentUser: User,
        @Res() res: Response,
        @Query('country') country?: string,
        @Query('year') year?: number,
        @Query('quarter') quarter?: number,

    ) {
        const csvData = await this.exportManagerService.exportFullCsv(
            currentUser,
            country,
            year,
            quarter
        );

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="distributors_full_export.csv"');
        res.send('\uFEFF' + csvData);
    }

    @Get('csv/assigned')
    @Roles(UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async exportAssignedCsv(
        @GetUser() currentUser: User,
        @Res() res: Response,
        @Query('distributorIds') distributorIds?: string,
        @Query('year') year?: number,
        @Query('quarter') quarter?: number,
    ) {
        const distributorIdArray = distributorIds ? distributorIds.split(',') : undefined;

        const csvData = await this.exportManagerService.exportAssignedCsv(
            currentUser,
            distributorIdArray,
            year,
            quarter
        );

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="assigned_distributors_export.csv"');
        res.send('\uFEFF' + csvData); // BOM dla UTF-8
    }


}