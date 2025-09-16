export class DistributorOverviewDto {
    id: string;
    company_name: string;
    country: string;
    currency: string;
    is_active: boolean;
    exportManager?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    latestSalesData?: {
        year: number;
        quarter: number;
        totalSales: number;
        totalSalesEur: number;
    };
    latestPurchaseData?: {
        year: number;
        quarter: number;
        actualSales: number;
        budget: number;
        totalPos: number;
    };
}