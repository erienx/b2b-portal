import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { LogsService } from './logs.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from 'src/common/enums/user-role.enum';
import { LogsQueryDto } from './dto/logs-query.dto';
import type { Response } from 'express';

@Controller('logs')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LogsController {
    constructor(private readonly logsService: LogsService) { }

    @Get()
    @Roles(UserRole.SUPER_ADMIN)
    async getLogs(@Query() q: LogsQueryDto) {
        return this.logsService.getLogs(q);
    }

    @Get('export')
    @Roles(UserRole.SUPER_ADMIN)
    async exportCsv(@Query() q: LogsQueryDto, @Res({ passthrough: true }) res: Response) {
        const csv = await this.logsService.exportLogsCsv(q);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="activity_logs_${Date.now()}.csv"`);
        return csv;
    }
}
