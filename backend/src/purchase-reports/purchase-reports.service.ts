import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseReport } from '../common/entities/purchase-report.entity';
import { Distributor } from '../common/entities/distributor.entity';
import { SalesChannelsReport } from '../common/entities/sales-channels-report.entity';
import { User } from '../common/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { CreatePurchaseReportDto } from './dto/create-purchase-report.dto';

@Injectable()
export class PurchaseReportsService {
    constructor(
        @InjectRepository(PurchaseReport)
        private readonly purchaseRepo: Repository<PurchaseReport>,

        @InjectRepository(Distributor)
        private readonly distributorRepo: Repository<Distributor>,

        @InjectRepository(SalesChannelsReport)
        private readonly salesRepo: Repository<SalesChannelsReport>,
    ) { }

    async createOrUpdate(distributorId: string | undefined, dto: CreatePurchaseReportDto, createdBy: User) {
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

        console.log(`Looking for sales report for distributor: ${distributorId}, year: ${dto.year}, quarter: ${dto.quarter}`);
        
        const salesReport = await this.salesRepo.findOne({
            where: { 
                distributor: { id: distributorId }, 
                year: dto.year, 
                quarter: dto.quarter 
            },
            relations: ['distributor']
        });

        console.log('Found sales report:', salesReport);

        let actualSales = 0;
        if (salesReport) {
            if (salesReport.total_sales && salesReport.total_sales > 0) {
                actualSales = Number(salesReport.total_sales);
            } else {
                actualSales = 
                    Number(salesReport.professional_sales || 0) +
                    Number(salesReport.pharmacy_sales || 0) +
                    Number(salesReport.ecommerce_b2c_sales || 0) +
                    Number(salesReport.ecommerce_b2b_sales || 0) +
                    Number(salesReport.third_party_sales || 0) +
                    Number(salesReport.other_sales || 0);
            }
        }

        console.log('Calculated actual sales:', actualSales);

        let report = await this.purchaseRepo.findOne({
            where: { distributor: { id: distributorId }, year: dto.year, quarter: dto.quarter },
        });

        if (!report) {
            report = this.purchaseRepo.create({ distributor, createdBy });
        }

        report.year = dto.year;
        report.quarter = dto.quarter;
        report.last_year_sales = dto.last_year_sales || 0;
        report.purchases = dto.purchases || 0;
        report.budget = dto.budget || 0;
        report.actual_sales = actualSales;
        report.total_pos = dto.total_pos || 0;
        report.new_openings = dto.new_openings || 0;
        report.new_openings_target = dto.new_openings_target || 0;
        report.createdBy = createdBy;

        const savedReport = await this.purchaseRepo.save(report);
        console.log('Saved report with actual_sales:', savedReport.actual_sales);
        
        return savedReport;
    }

    async findForYearQuarter(distributorId: string, year: number, quarter: number) {
        const report = await this.purchaseRepo.findOne({
            where: { distributor: { id: distributorId }, year, quarter },
            relations: ['distributor'],
        });

        const salesReport = await this.salesRepo.findOne({
            where: { 
                distributor: { id: distributorId }, 
                year, 
                quarter 
            },
            relations: ['distributor']
        });

        let actualSales = 0;
        if (salesReport) {
            if (salesReport.total_sales && salesReport.total_sales > 0) {
                actualSales = Number(salesReport.total_sales);
            } else {
                actualSales = 
                    Number(salesReport.professional_sales || 0) +
                    Number(salesReport.pharmacy_sales || 0) +
                    Number(salesReport.ecommerce_b2c_sales || 0) +
                    Number(salesReport.ecommerce_b2b_sales || 0) +
                    Number(salesReport.third_party_sales || 0) +
                    Number(salesReport.other_sales || 0);
            }
        }

        if (!report) {
            return {
                id: null,
                year,
                quarter,
                last_year_sales: 0,
                purchases: 0,
                budget: 0,
                actual_sales: actualSales, 
                total_pos: 0,
                new_openings: 0,
                new_openings_target: 0,
                totalYearVsLastYear: actualSales,
                totalYearVsBudget: actualSales,
                distributor: null,
                created_at: null,
                updated_at: null,
                createdBy: null,
            };
        }

        if (actualSales > 0 && actualSales !== Number(report.actual_sales)) {
            report.actual_sales = actualSales;
            await this.purchaseRepo.save(report);
        }

        const totalYearVsLastYear = actualSales - Number(report.last_year_sales);
        const totalYearVsBudget = actualSales - Number(report.budget);

        return {
            ...report,
            actual_sales: actualSales, 
            totalYearVsLastYear,
            totalYearVsBudget,
        };
    }

    async findAllForUser(user: User) {
        const queryBuilder = this.purchaseRepo
            .createQueryBuilder('pr')
            .leftJoinAndSelect('pr.distributor', 'distributor')
            .orderBy('pr.year', 'DESC')
            .addOrderBy('pr.quarter', 'DESC');

        if ([UserRole.DISTRIBUTOR, UserRole.EMPLOYEE].includes(user.role)) {
            queryBuilder
                .innerJoin('distributor.assignments', 'uda')
                .where('uda.userId = :userId', { userId: user.id });
        } else if (user.role === UserRole.EXPORT_MANAGER) {
            queryBuilder.where('distributor.exportManagerId = :managerId', { managerId: user.id });
        }

        const reports = await queryBuilder.getMany();

        const enhancedReports = await Promise.all(
            reports.map(async (report) => {
                const salesReport = await this.salesRepo.findOne({
                    where: { 
                        distributor: { id: report.distributor.id }, 
                        year: report.year, 
                        quarter: report.quarter 
                    }
                });

                let actualSales = Number(report.actual_sales);
                if (salesReport) {
                    if (salesReport.total_sales && salesReport.total_sales > 0) {
                        actualSales = Number(salesReport.total_sales);
                    } else {
                        actualSales = 
                            Number(salesReport.professional_sales || 0) +
                            Number(salesReport.pharmacy_sales || 0) +
                            Number(salesReport.ecommerce_b2c_sales || 0) +
                            Number(salesReport.ecommerce_b2b_sales || 0) +
                            Number(salesReport.third_party_sales || 0) +
                            Number(salesReport.other_sales || 0);
                    }
                }

                return {
                    ...report,
                    actual_sales: actualSales,
                    totalYearVsLastYear: actualSales - Number(report.last_year_sales),
                    totalYearVsBudget: actualSales - Number(report.budget),
                };
            })
        );

        return enhancedReports;
    }

    async getAssignedDistributor(user: User): Promise<Distributor | null> {
        const distributor = await this.distributorRepo
            .createQueryBuilder('d')
            .innerJoin('d.assignments', 'uda')
            .where('uda.userId = :userId', { userId: user.id })
            .getOne();

        return distributor;
    }

    async isDistributorAssignedToManager(distributorId: string, managerId: string): Promise<boolean> {
        const distributor = await this.distributorRepo.findOne({
            where: { 
                id: distributorId, 
                exportManager: { id: managerId } 
            }
        });

        return !!distributor;
    }

    async getDashboardData(distributorId: string, year: number) {
        const reports = await this.purchaseRepo.find({
            where: { distributor: { id: distributorId }, year },
            order: { quarter: 'ASC' },
        });

        const enhancedData = await Promise.all(
            Array.from({ length: 4 }, (_, i) => i + 1).map(async (quarter) => {
                const report = reports.find(r => r.quarter === quarter);
                
                const salesReport = await this.salesRepo.findOne({
                    where: { 
                        distributor: { id: distributorId }, 
                        year, 
                        quarter 
                    }
                });

                let actualSales = 0;
                if (salesReport) {
                    if (salesReport.total_sales && salesReport.total_sales > 0) {
                        actualSales = Number(salesReport.total_sales);
                    } else {
                        actualSales = 
                            Number(salesReport.professional_sales || 0) +
                            Number(salesReport.pharmacy_sales || 0) +
                            Number(salesReport.ecommerce_b2c_sales || 0) +
                            Number(salesReport.ecommerce_b2b_sales || 0) +
                            Number(salesReport.third_party_sales || 0) +
                            Number(salesReport.other_sales || 0);
                    }
                }

                return {
                    quarter,
                    lastYearSales: Number(report?.last_year_sales || 0),
                    purchases: Number(report?.purchases || 0),
                    budget: Number(report?.budget || 0),
                    actualSales: actualSales,
                    totalYearVsLastYear: actualSales - Number(report?.last_year_sales || 0),
                    totalYearVsBudget: actualSales - Number(report?.budget || 0),
                    totalPos: report?.total_pos || 0,
                    newOpenings: report?.new_openings || 0,
                    newOpeningsTarget: report?.new_openings_target || 0,
                };
            })
        );

        return enhancedData;
    }

    async debugSalesData(distributorId: string, year: number, quarter: number) {
        console.log(`=== DEBUG SALES DATA ===`);
        console.log(`Distributor: ${distributorId}, Year: ${year}, Quarter: ${quarter}`);
        
        const salesReports = await this.salesRepo.find({
            where: { distributor: { id: distributorId } },
            relations: ['distributor']
        });
        
        console.log(`Found ${salesReports.length} sales reports for distributor`);
        salesReports.forEach(report => {
            console.log(`Report: Y${report.year} Q${report.quarter} - Total: ${report.total_sales}`);
        });

        const specificReport = await this.salesRepo.findOne({
            where: { distributor: { id: distributorId }, year, quarter },
            relations: ['distributor']
        });

        if (specificReport) {
            console.log('Specific report found:', {
                id: specificReport.id,
                total_sales: specificReport.total_sales,
                professional_sales: specificReport.professional_sales,
                pharmacy_sales: specificReport.pharmacy_sales,
            });
        } else {
            console.log('No specific report found for this year/quarter');
        }
        
        console.log(`=== END DEBUG ===`);
        return specificReport;
    }
}