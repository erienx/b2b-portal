import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesChannelsReport } from '../common/entities/sales-channels-report.entity';
import { Distributor } from '../common/entities/distributor.entity';
import { User } from '../common/entities/user.entity';
import { CurrencyService } from '../currency/currency.service';
import { CreateSalesReportDto } from './dto/create-sales-report.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class SalesChannelsService {
    constructor(
        @InjectRepository(SalesChannelsReport)
        private readonly reportRepo: Repository<SalesChannelsReport>,
        @InjectRepository(Distributor)
        private readonly distributorRepo: Repository<Distributor>,
        private readonly currencyService: CurrencyService,
    ) { }

    private async computeTotalAndEur(
        dto: CreateSalesReportDto,
        currency: string,
        year: number,
        quarter: number,
    ) {
        const total =
            Number(dto.professional_sales || 0) +
            Number(dto.pharmacy_sales || 0) +
            Number(dto.ecommerce_b2c_sales || 0) +
            Number(dto.ecommerce_b2b_sales || 0) +
            Number(dto.third_party_sales || 0) +
            Number(dto.other_sales || 0);

        const quarterMonths = { 1: [1, 2, 3], 2: [4, 5, 6], 3: [7, 8, 9], 4: [10, 11, 12] }[quarter];
        const rates = await Promise.all(
            quarterMonths!.map(m => this.currencyService.getRate(currency, new Date(year, m - 1, 15)))
        );
        const avgRate = rates.reduce((s, n) => s + n, 0) / rates.length;

        const totalEur = Number((total * avgRate).toFixed(2));

        return { total, totalEur, avgRate };
    }

    async createOrUpdate(distributorId: string | undefined, dto: CreateSalesReportDto, createdBy: User) {
        if (!distributorId) {
            if ([UserRole.DISTRIBUTOR, UserRole.EMPLOYEE].includes(createdBy.role)) {
                const dist = await this.distributorRepo
                    .createQueryBuilder('d')
                    .innerJoin('d.assignments', 'uda')
                    .where('uda.userId = :userId', { userId: createdBy.id })
                    .getOne();
                if (!dist) throw new NotFoundException('No distributor assigned to current user');
                distributorId = dist.id;
            } else {
                throw new NotFoundException('Distributor ID required');
            }
        }

        const distributor = await this.distributorRepo.findOne({ where: { id: distributorId } });
        if (!distributor) throw new NotFoundException('Distributor not found');

        const { total, totalEur, avgRate } = await this.computeTotalAndEur(
            dto,
            distributor.currency,
            dto.year,
            dto.quarter,
        );

        let report = await this.reportRepo.findOne({
            where: { distributor: { id: distributorId }, year: dto.year, quarter: dto.quarter },
        });

        if (!report) {
            report = this.reportRepo.create({ distributor, createdBy });
        }

        report.year = dto.year;
        report.quarter = dto.quarter;
        report.currency = distributor.currency;
        report.professional_sales = dto.professional_sales;
        report.pharmacy_sales = dto.pharmacy_sales;
        report.ecommerce_b2c_sales = dto.ecommerce_b2c_sales;
        report.ecommerce_b2b_sales = dto.ecommerce_b2b_sales;
        report.third_party_sales = dto.third_party_sales;
        report.other_sales = dto.other_sales;
        report.total_sales = total;
        report.total_sales_eur = totalEur;
        report.currency_rate = avgRate;
        report.new_clients = dto.new_clients || 0;
        report.createdBy = createdBy;

        return this.reportRepo.save(report);
    }

    async importCsv(fileBuffer: Buffer, user: User): Promise<SalesChannelsReport[]> {
        const text = fileBuffer.toString('utf-8');
        const lines = text.split('\n').filter(l => l.trim() !== '');
        const results: SalesChannelsReport[] = [];

        for (const line of lines.slice(1)) {
            const cols = line.split(',');
            if (cols.length < 9) continue;

            const dto: CreateSalesReportDto = {
                year: Number(cols[0]),
                quarter: Number(cols[1]),
                professional_sales: Number(cols[2]),
                pharmacy_sales: Number(cols[3]),
                ecommerce_b2c_sales: Number(cols[4]),
                ecommerce_b2b_sales: Number(cols[5]),
                third_party_sales: Number(cols[6]),
                other_sales: Number(cols[7]),
                new_clients: Number(cols[8]),
            };

            let distributorId: string;
            if ([UserRole.DISTRIBUTOR, UserRole.EMPLOYEE].includes(user.role)) {
                const dist = await this.distributorRepo
                    .createQueryBuilder('d')
                    .innerJoin('d.assignments', 'uda')
                    .where('uda.userId = :userId', { userId: user.id })
                    .getOne();
                if (!dist) throw new NotFoundException('No distributor assigned to current user');
                distributorId = dist.id;
            } else {
                throw new NotFoundException('Distributor ID required for CSV import');
            }

            const report = await this.createOrUpdate(distributorId, dto, user);
            results.push(report);
        }

        return results;
    }

    async findForYearQuarter(distributorId: string, year: number, quarter: number) {
        return this.reportRepo.findOne({
            where: { distributor: { id: distributorId }, year, quarter },
        });
    }

    async findAllForUser(user: User) {
        if ([UserRole.DISTRIBUTOR, UserRole.EMPLOYEE].includes(user.role)) {
            const dist = await this.distributorRepo
                .createQueryBuilder('d')
                .innerJoin('d.assignments', 'uda')
                .where('uda.userId = :userId', { userId: user.id })
                .getOne();
            if (!dist) return [];
            return this.reportRepo.find({ where: { distributor: { id: dist.id } }, relations: ['distributor', 'createdBy'] });
        }

        return this.reportRepo.find({ relations: ['distributor', 'createdBy'] });
    }
    async getAssignedDistributor(user: User): Promise<Distributor | null> {
        const assignment = await this.distributorRepo
            .createQueryBuilder('d')
            .innerJoin('d.assignments', 'uda')
            .where('uda.userId = :userId', { userId: user.id })
            .getOne();

        return assignment || null;
    }
}
