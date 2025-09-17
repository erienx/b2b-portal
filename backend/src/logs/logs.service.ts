import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivityLog } from 'src/common/entities/user-activity-log.entity';
import { User } from 'src/common/entities/user.entity';
import { LogsQueryDto } from './dto/logs-query.dto';

@Injectable()
export class LogsService {
    constructor(
        @InjectRepository(UserActivityLog)
        private readonly logsRepo: Repository<UserActivityLog>,
    ) { }

    private mapLog(row: UserActivityLog) {
        return {
            id: row.id,
            user: row.user
                ? {
                    id: row.user.id,
                    email: row.user.email,
                    firstName: (row.user as User).first_name || (row.user as any).firstName,
                    lastName: (row.user as User).last_name || (row.user as any).lastName,
                    role: (row.user as any).role,
                }
                : null,
            action: row.action,
            resourceType: row.resource_type,
            resourceId: row.resource_id,
            ipAddress: row.ip_address,
            userAgent: row.user_agent,
            details: row.details,
            createdAt: row.created_at,
        };
    }

    async getLogs(q: LogsQueryDto) {
        const page = q.page && q.page > 0 ? q.page : 1;
        const limit = q.limit && q.limit > 0 ? Math.min(q.limit, 200) : 50;
        const qb = this.logsRepo.createQueryBuilder('log').leftJoinAndSelect('log.user', 'user');

        if (q.userId) qb.andWhere('user.id = :userId', { userId: q.userId });
        if (q.action) qb.andWhere('log.action = :action', { action: q.action });
        if (q.resourceType) qb.andWhere('log.resource_type = :resourceType', { resourceType: q.resourceType });
        if (q.search) {
            qb.andWhere('(log.user_agent ILIKE :search OR CAST(log.details AS TEXT) ILIKE :search OR user.email ILIKE :search)', { search: `%${q.search}%` });
        }
        if (q.dateFrom) qb.andWhere('log.created_at >= :dateFrom', { dateFrom: q.dateFrom });
        if (q.dateTo) qb.andWhere('log.created_at <= :dateTo', { dateTo: q.dateTo });

        qb.orderBy('log.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [rows, total] = await qb.getManyAndCount();
        return {
            logs: rows.map(r => this.mapLog(r)),
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    async exportLogsCsv(q: LogsQueryDto) {
        const qb = this.logsRepo.createQueryBuilder('log').leftJoinAndSelect('log.user', 'user');

        if (q.userId) qb.andWhere('user.id = :userId', { userId: q.userId });
        if (q.action) qb.andWhere('log.action = :action', { action: q.action });
        if (q.resourceType) qb.andWhere('log.resource_type = :resourceType', { resourceType: q.resourceType });
        if (q.search) qb.andWhere('(log.user_agent ILIKE :search OR CAST(log.details AS TEXT) ILIKE :search OR user.email ILIKE :search)', { search: `%${q.search}%` });
        if (q.dateFrom) qb.andWhere('log.created_at >= :dateFrom', { dateFrom: q.dateFrom });
        if (q.dateTo) qb.andWhere('log.created_at <= :dateTo', { dateTo: q.dateTo });

        qb.orderBy('log.created_at', 'DESC');

        const rows = await qb.getMany();

        const header = ['id', 'createdAt', 'userId', 'userEmail', 'action', 'resourceType', 'resourceId', 'ipAddress', 'userAgent', 'details'];
        const lines = [header.join(',')];

        for (const r of rows) {
            const detailsStr = r.details ? JSON.stringify(r.details).replace(/"/g, '""') : '';
            const cols = [
                r.id,
                r.created_at.toISOString(),
                r.user?.id ?? '',
                r.user?.email ?? '',
                r.action,
                r.resource_type ?? '',
                r.resource_id ?? '',
                r.ip_address ?? '',
                (r.user_agent ?? '').replace(/"/g, '""'),
                `"${detailsStr}"`,
            ];
            lines.push(cols.join(','));
        }

        return lines.join('\n');
    }
}
