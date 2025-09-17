export type DistributorOverview = {
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
};

export type Substitution = {
    id: string;
    exportManager: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    substitute: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    start_date: string;
    end_date: string;
    is_active: boolean;
    createdBy?: {
        id: string;
        first_name: string;
        last_name: string;
    };
    created_at: string;
};

export type ExportManager = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
};