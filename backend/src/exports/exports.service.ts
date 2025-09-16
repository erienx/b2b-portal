import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Distributor } from 'src/common/entities/distributor.entity';
import { User } from 'src/common/entities/user.entity';
import { ExportManagerSubstitution } from 'src/common/entities/export-manager-substitution.entity';
import { SalesChannelsReport } from 'src/common/entities/sales-channels-report.entity';
import { PurchaseReport } from 'src/common/entities/purchase-report.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { CreateSubstitutionDto } from './dto/create-substitution.dto';
import { UpdateSubstitutionDto } from './dto/update-substitution.dto';
import { DistributorOverviewDto } from './dto/distributor-overview.dto';
import { SubstitutionDto } from './dto/substitution.dto';

@Injectable()
export class ExportsService {
    constructor(
        @InjectRepository(Distributor)
        private distributorRepository: Repository<Distributor>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(ExportManagerSubstitution)
        private substitutionRepository: Repository<ExportManagerSubstitution>,
        @InjectRepository(SalesChannelsReport)
        private salesReportRepository: Repository<SalesChannelsReport>,
        @InjectRepository(PurchaseReport)
        private purchaseReportRepository: Repository<PurchaseReport>,
    ) { }

    async getDistributorsOverview(
        currentUser: User,
        country?: string,
        distributorId?: string,
    ): Promise<DistributorOverviewDto[]> {
        let accessibleDistributorIds: string[] = [];

        if (currentUser.role === UserRole.EXPORT_MANAGER) {
            // Export Manager widzi tylko przypisanych dystrybutorów + zastępstwa
            const directlyManaged = await this.distributorRepository.find({
                where: { exportManager: { id: currentUser.id } },
                select: ['id'],
            });

            accessibleDistributorIds = directlyManaged.map(d => d.id);

            // Dodaj dystrybutorów z zastępstw
            const activeSubstitutions = await this.substitutionRepository.find({
                where: {
                    substitute: { id: currentUser.id },
                    is_active: true,
                    start_date: new Date(),
                    end_date: new Date(),
                },
                relations: ['exportManager'],
            });

            for (const substitution of activeSubstitutions) {
                const substitutedDistributors = await this.distributorRepository.find({
                    where: { exportManager: { id: substitution.exportManager.id } },
                    select: ['id'],
                });
                accessibleDistributorIds.push(...substitutedDistributors.map(d => d.id));
            }

            // Usuń duplikaty
            accessibleDistributorIds = [...new Set(accessibleDistributorIds)];
        }

        // Buduj zapytanie
        const queryBuilder = this.distributorRepository
            .createQueryBuilder('distributor')
            .leftJoinAndSelect('distributor.exportManager', 'exportManager')
            .where('distributor.is_active = :isActive', { isActive: true });

        // Filtrowanie według uprawnień
        if (currentUser.role === UserRole.EXPORT_MANAGER) {
            if (accessibleDistributorIds.length === 0) {
                return [];
            }
            queryBuilder.andWhere('distributor.id IN (:...ids)', { ids: accessibleDistributorIds });
        }

        // Filtrowanie według kraju
        if (country) {
            queryBuilder.andWhere('distributor.country = :country', { country });
        }

        // Filtrowanie według konkretnego dystrybutora
        if (distributorId) {
            queryBuilder.andWhere('distributor.id = :distributorId', { distributorId });
        }

        const distributors = await queryBuilder.getMany();

        // Pobierz najnowsze dane sprzedażowe i zakupowe dla każdego dystrybutora
        const result: DistributorOverviewDto[] = [];

        for (const distributor of distributors) {
            const latestSalesReport = await this.salesReportRepository.findOne({
                where: { distributor: { id: distributor.id } },
                order: { year: 'DESC', quarter: 'DESC' },
            });

            const latestPurchaseReport = await this.purchaseReportRepository.findOne({
                where: { distributor: { id: distributor.id } },
                order: { year: 'DESC', quarter: 'DESC' },
            });

            result.push({
                id: distributor.id,
                company_name: distributor.company_name,
                country: distributor.country,
                currency: distributor.currency,
                is_active: distributor.is_active,
                exportManager: distributor.exportManager ? {
                    id: distributor.exportManager.id,
                    first_name: distributor.exportManager.first_name,
                    last_name: distributor.exportManager.last_name,
                    email: distributor.exportManager.email,
                } : undefined,
                latestSalesData: latestSalesReport ? {
                    year: latestSalesReport.year,
                    quarter: latestSalesReport.quarter,
                    totalSales: Number(latestSalesReport.total_sales),
                    totalSalesEur: Number(latestSalesReport.total_sales_eur),
                } : undefined,
                latestPurchaseData: latestPurchaseReport ? {
                    year: latestPurchaseReport.year,
                    quarter: latestPurchaseReport.quarter,
                    actualSales: Number(latestPurchaseReport.actual_sales),
                    budget: Number(latestPurchaseReport.budget),
                    totalPos: latestPurchaseReport.total_pos,
                } : undefined,
            });
        }

        return result;
    }

    async getAvailableCountries(currentUser: User): Promise<string[]> {
        const overview = await this.getDistributorsOverview(currentUser);
        const countries = [...new Set(overview.map(d => d.country))].sort();
        return countries;
    }

    async createSubstitution(dto: CreateSubstitutionDto, createdBy: User): Promise<SubstitutionDto> {
        // Sprawdź czy export manager istnieje i ma odpowiednią rolę
        const exportManager = await this.userRepository.findOne({
            where: { id: dto.exportManagerId, role: UserRole.EXPORT_MANAGER, is_active: true },
        });

        if (!exportManager) {
            throw new NotFoundException('Export Manager not found or inactive');
        }

        // Sprawdź czy substitute istnieje i ma odpowiednią rolę
        const substitute = await this.userRepository.findOne({
            where: {
                id: dto.substituteId,
                role: UserRole.EXPORT_MANAGER,
                is_active: true
            },
        });

        if (!substitute) {
            throw new NotFoundException('Substitute user not found, inactive, or not an Export Manager');
        }

        // Sprawdź czy daty są poprawne
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);

        if (startDate >= endDate) {
            throw new BadRequestException('Start date must be before end date');
        }

        // Sprawdź czy nie ma nakładających się zastępstw
        const overlapping = await this.substitutionRepository
            .createQueryBuilder('sub')
            .where('sub.exportManager.id = :exportManagerId', { exportManagerId: dto.exportManagerId })
            .andWhere('sub.is_active = :isActive', { isActive: true })
            .andWhere('(sub.start_date <= :endDate AND sub.end_date >= :startDate)', {
                startDate: dto.startDate,
                endDate: dto.endDate,
            })
            .getOne();

        if (overlapping) {
            throw new BadRequestException('Overlapping substitution period exists');
        }

        const substitution = this.substitutionRepository.create({
            exportManager,
            substitute,
            start_date: startDate,
            end_date: endDate,
            is_active: dto.isActive ?? true,
            createdBy,
        });

        const saved = await this.substitutionRepository.save(substitution);

        const result = await this.substitutionRepository.findOne({
            where: { id: saved.id },
            relations: ['exportManager', 'substitute', 'createdBy'],
        });
        if (!result) {
            throw new NotFoundException('Created substitution not found');
        }
        return this.mapSubstitutionToDto(result);
    }

    async getSubstitutions(currentUser: User): Promise<SubstitutionDto[]> {
        let whereCondition = {};

        if (currentUser.role === UserRole.EXPORT_MANAGER) {
            // Export Manager widzi tylko swoje zastępstwa (jako główny lub zastępca)
            whereCondition = [
                { exportManager: { id: currentUser.id } },
                { substitute: { id: currentUser.id } },
            ];
        }

        const substitutions = await this.substitutionRepository.find({
            where: whereCondition,
            relations: ['exportManager', 'substitute', 'createdBy'],
            order: { created_at: 'DESC' },
        });

        return substitutions.map(sub => this.mapSubstitutionToDto(sub));
    }

    async getSubstitution(id: string, currentUser: User): Promise<SubstitutionDto> {
        const substitution = await this.substitutionRepository.findOne({
            where: { id },
            relations: ['exportManager', 'substitute', 'createdBy'],
        });

        if (!substitution) {
            throw new NotFoundException('Substitution not found');
        }

        // Sprawdź uprawnienia
        if (currentUser.role === UserRole.EXPORT_MANAGER) {
            const isInvolved = substitution.exportManager.id === currentUser.id ||
                substitution.substitute.id === currentUser.id;
            if (!isInvolved) {
                throw new ForbiddenException('Access denied');
            }
        }

        return this.mapSubstitutionToDto(substitution);
    }

    async updateSubstitution(
        id: string,
        dto: UpdateSubstitutionDto,
        updatedBy: User,
    ): Promise<SubstitutionDto> {
        const substitution = await this.substitutionRepository.findOne({
            where: { id },
            relations: ['exportManager', 'substitute'],
        });

        if (!substitution) {
            throw new NotFoundException('Substitution not found');
        }

        // Sprawdź uprawnienia - tylko admini i super-admini mogą edytować
        if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(updatedBy.role)) {
            throw new ForbiddenException('Access denied');
        }

        // Aktualizuj pola
        if (dto.startDate) substitution.start_date = new Date(dto.startDate);
        if (dto.endDate) substitution.end_date = new Date(dto.endDate);
        if (dto.isActive !== undefined) substitution.is_active = dto.isActive;

        // Sprawdź czy daty są poprawne
        if (substitution.start_date >= substitution.end_date) {
            throw new BadRequestException('Start date must be before end date');
        }

        await this.substitutionRepository.save(substitution);

        const res = await this.substitutionRepository.findOne({
            where: { id },
            relations: ['exportManager', 'substitute', 'createdBy'],
        });
        if (!res) {
            throw new NotFoundException('Substitution not found');
        }
        return this.mapSubstitutionToDto(res);
    }

    async deactivateSubstitution(id: string, currentUser: User): Promise<void> {
        const substitution = await this.substitutionRepository.findOne({
            where: { id },
            relations: ['exportManager'],
        });

        if (!substitution) {
            throw new NotFoundException('Substitution not found');
        }

        // Sprawdź uprawnienia
        if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
            throw new ForbiddenException('Access denied');
        }

        substitution.is_active = false;
        await this.substitutionRepository.save(substitution);
    }

    async getExportManagers(): Promise<{ id: string; first_name: string; last_name: string; email: string }[]> {
        const exportManagers = await this.userRepository.find({
            where: { role: UserRole.EXPORT_MANAGER, is_active: true },
            select: ['id', 'first_name', 'last_name', 'email'],
        });

        return exportManagers;
    }

    private mapSubstitutionToDto(substitution: ExportManagerSubstitution): SubstitutionDto {
        return {
            id: substitution.id,
            exportManager: {
                id: substitution.exportManager.id,
                first_name: substitution.exportManager.first_name,
                last_name: substitution.exportManager.last_name,
                email: substitution.exportManager.email,
            },
            substitute: {
                id: substitution.substitute.id,
                first_name: substitution.substitute.first_name,
                last_name: substitution.substitute.last_name,
                email: substitution.substitute.email,
            },
            start_date: substitution.start_date,
            end_date: substitution.end_date,
            is_active: substitution.is_active,
            createdBy: substitution.createdBy ? {
                id: substitution.createdBy.id,
                first_name: substitution.createdBy.first_name,
                last_name: substitution.createdBy.last_name,
            } : undefined,
            created_at: substitution.created_at,
        };
    }

    async exportFullCsv(
        currentUser: User,
        country?: string,
        year?: number,
        quarter?: number
    ): Promise<string> {
        // Tylko ADMIN i SUPER_ADMIN mogą eksportować wszystkie dane
        if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
            throw new ForbiddenException('Insufficient permissions for full export');
        }

        const distributors = await this.getDistributorsForExport(currentUser, country);
        return this.generateCsvData(distributors, year, quarter);
    }

    async exportAssignedCsv(
        currentUser: User,
        distributorIds?: string[],
        year?: number,
        quarter?: number
    ): Promise<string> {
        let distributors: Distributor[];

        if (currentUser.role === UserRole.EXPORT_MANAGER) {
            // Export Manager widzi tylko przypisanych dystrybutorów
            distributors = await this.getDistributorsForUser(currentUser);

            // Jeśli podano konkretne ID, filtruj tylko te które są przypisane
            if (distributorIds && distributorIds.length > 0) {
                const assignedIds = distributors.map(d => d.id);
                const requestedIds = distributorIds.filter(id => assignedIds.includes(id));

                if (requestedIds.length === 0) {
                    throw new NotFoundException('No assigned distributors found for the given IDs');
                }

                distributors = distributors.filter(d => requestedIds.includes(d.id));
            }
        } else if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
            // Admin może eksportować wybrane dystrybutorów lub wszystkich
            if (distributorIds && distributorIds.length > 0) {
                distributors = await this.distributorRepository.find({
                    where: { id: In(distributorIds) },
                    relations: ['exportManager']
                });
            } else {
                distributors = await this.getDistributorsForUser(currentUser);
            }
        } else {
            throw new ForbiddenException('Insufficient permissions');
        }

        return this.generateCsvData(distributors, year, quarter);
    }

    private async getDistributorsForUser(user: User): Promise<Distributor[]> {
        if (user.role === UserRole.EXPORT_MANAGER) {
            const directlyManaged = await this.distributorRepository.find({
                where: { exportManager: { id: user.id } },
                relations: ['exportManager'],
            });

            const today = new Date();
            const activeSubstitutions = await this.substitutionRepository.find({
                where: {
                    substitute: { id: user.id },
                    is_active: true,
                    start_date: LessThanOrEqual(today),
                    end_date: MoreThanOrEqual(today),
                },
                relations: ['exportManager'],
            });

            let substitutedDistributors: Distributor[] = [];
            for (const substitution of activeSubstitutions) {
                const distrs = await this.distributorRepository.find({
                    where: { exportManager: { id: substitution.exportManager.id } },
                    relations: ['exportManager'],
                });
                substitutedDistributors.push(...distrs);
            }

            const allDistributors = [...directlyManaged, ...substitutedDistributors];
            return allDistributors.filter((dist, index, self) =>
                index === self.findIndex(d => d.id === dist.id)
            );
        }

        if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
            return this.distributorRepository.find({
                relations: ['exportManager'],
            });
        }

        return [];
    }

    private async getDistributorsForExport(
        currentUser: User,
        country?: string
    ): Promise<Distributor[]> {
        const queryBuilder = this.distributorRepository
            .createQueryBuilder('distributor')
            .leftJoinAndSelect('distributor.exportManager', 'exportManager');

        if (country) {
            queryBuilder.where('distributor.country = :country', { country });
        }

        return queryBuilder.getMany();
    }

    private async generateCsvData(
        distributors: Distributor[],
        year?: number,
        quarter?: number
    ): Promise<string> {
        const csvHeaders = [
            'Distributor',
            'Currency',
            'Year',
            'Quarter',
            'Sales_Channels_Professional_Sales',
            'Sales_Channels_Pharmacy_Sales',
            'Sales_Channels_Ecommerce_B2C_Sales',
            'Sales_Channels_Ecommerce_B2B_Sales',
            'Sales_Channels_Third_Party',
            'Sales_Channels_Other',
            'Sales_Channels_Total_Sales',
            'Sales_Channels_New_Clients',
            'Sales_Channels_Professional_Sales_EUR',
            'Sales_Channels_Pharmacy_Sales_EUR',
            'Sales_Channels_Ecommerce_B2C_Sales_EUR',
            'Sales_Channels_Ecommerce_B2B_Sales_EUR',
            'Sales_Channels_Third_Party_EUR',
            'Sales_Channels_Other_EUR',
            'Sales_Channels_Total_Sales_EUR',
            'Purchase_Report_Last_Year_Sales',
            'Purchase_Report_Purchases',
            'Purchase_Report_Budget',
            'Purchase_Report_Actual_Sales',
            'Purchase_Report_Total_vs_Last_Year',
            'Purchase_Report_Total_vs_Budget',
            'Purchase_Report_Total_POS',
            'Purchase_Report_New_Openings',
            'Purchase_Report_New_Openings_Target'
        ];

        const csvRows: string[] = [csvHeaders.join(',')];

        for (const distributor of distributors) {
            const salesQuery = this.salesReportRepository
                .createQueryBuilder('sr')
                .where('sr.distributorId = :distributorId', { distributorId: distributor.id });

            const purchaseQuery = this.purchaseReportRepository
                .createQueryBuilder('pr')
                .where('pr.distributorId = :distributorId', { distributorId: distributor.id });

            if (year) {
                salesQuery.andWhere('sr.year = :year', { year });
                purchaseQuery.andWhere('pr.year = :year', { year });
            }

            if (quarter) {
                salesQuery.andWhere('sr.quarter = :quarter', { quarter });
                purchaseQuery.andWhere('pr.quarter = :quarter', { quarter });
            }

            const salesReports = await salesQuery.getMany();
            const purchaseReports = await purchaseQuery.getMany();

            // Jeśli nie ma danych, dodaj pustą linię dla dystrybutora
            if (salesReports.length === 0 && purchaseReports.length === 0) {
                const emptyRow = this.createEmptyRow(distributor);
                csvRows.push(emptyRow);
                continue;
            }

            // Łącz dane sales i purchase po roku/kwartale
            const dataMap = new Map<string, { sales?: SalesChannelsReport; purchase?: PurchaseReport }>();

            salesReports.forEach(sr => {
                const key = `${sr.year}-${sr.quarter}`;
                if (!dataMap.has(key)) dataMap.set(key, {});
                dataMap.get(key)!.sales = sr;
            });

            purchaseReports.forEach(pr => {
                const key = `${pr.year}-${pr.quarter}`;
                if (!dataMap.has(key)) dataMap.set(key, {});
                dataMap.get(key)!.purchase = pr;
            });

            for (const [key, data] of dataMap) {
                const [reportYear, reportQuarter] = key.split('-');
                const row = this.createDataRow(distributor, data.sales, data.purchase, reportYear, reportQuarter);
                csvRows.push(row);
            }
        }

        return csvRows.join('\n');
    }

    private createEmptyRow(distributor: Distributor): string {
        return [
            this.escapeCsvValue(distributor.company_name),
            distributor.currency,
            '', // Year
            '', // Quarter
            ...Array(24).fill('') // Wszystkie pozostałe kolumny puste
        ].join(',');
    }

    private createDataRow(
        distributor: Distributor,
        sales?: SalesChannelsReport,
        purchase?: PurchaseReport,
        year?: string,
        quarter?: string
    ): string {
        const row = [
            this.escapeCsvValue(distributor.company_name),
            sales?.currency || distributor.currency,
            year || '',
            quarter || '',

            // Sales Channels dane w oryginalnej walucie
            sales?.professional_sales?.toString() || '',
            sales?.pharmacy_sales?.toString() || '',
            sales?.ecommerce_b2c_sales?.toString() || '',
            sales?.ecommerce_b2b_sales?.toString() || '',
            sales?.third_party_sales?.toString() || '',
            sales?.other_sales?.toString() || '',
            sales?.total_sales?.toString() || '',
            sales?.new_clients?.toString() || '',

            // Sales Channels dane w EUR
            sales?.professional_sales && sales?.currency_rate
                ? (Number(sales.professional_sales) * Number(sales.currency_rate)).toFixed(2)
                : '',
            sales?.pharmacy_sales && sales?.currency_rate
                ? (Number(sales.pharmacy_sales) * Number(sales.currency_rate)).toFixed(2)
                : '',
            sales?.ecommerce_b2c_sales && sales?.currency_rate
                ? (Number(sales.ecommerce_b2c_sales) * Number(sales.currency_rate)).toFixed(2)
                : '',
            sales?.ecommerce_b2b_sales && sales?.currency_rate
                ? (Number(sales.ecommerce_b2b_sales) * Number(sales.currency_rate)).toFixed(2)
                : '',
            sales?.third_party_sales && sales?.currency_rate
                ? (Number(sales.third_party_sales) * Number(sales.currency_rate)).toFixed(2)
                : '',
            sales?.other_sales && sales?.currency_rate
                ? (Number(sales.other_sales) * Number(sales.currency_rate)).toFixed(2)
                : '',
            sales?.total_sales_eur?.toString() || '',

            // Purchase Report dane
            purchase?.last_year_sales?.toString() || '',
            purchase?.purchases?.toString() || '',
            purchase?.budget?.toString() || '',
            purchase?.actual_sales?.toString() || '',

            // Automatyczne obliczenia Purchase Report
            purchase && purchase.actual_sales && purchase.last_year_sales
                ? (Number(purchase.actual_sales) - Number(purchase.last_year_sales)).toFixed(2)
                : '',
            purchase && purchase.actual_sales && purchase.budget
                ? (Number(purchase.actual_sales) - Number(purchase.budget)).toFixed(2)
                : '',

            purchase?.total_pos?.toString() || '',
            purchase?.new_openings?.toString() || '',
            purchase?.new_openings_target?.toString() || ''
        ];

        return row.join(',');
    }

    private escapeCsvValue(value: string): string {
        if (!value) return '';

        // Jeśli wartość zawiera przecinek, cudzysłów lub znak nowej linii, otocz cudzysłowami
        if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
            // Podwój wszystkie cudzysłowy wewnętrzne
            const escaped = value.replace(/"/g, '""');
            return `"${escaped}"`;
        }

        return value;
    }
}