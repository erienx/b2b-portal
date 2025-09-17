import { IsNumber, IsOptional, IsUUID, Min, IsArray, ValidateNested, IsString } from 'class-validator';

export class CreateSalesReportDto {
    @IsNumber()
    year: number;

    @IsNumber()
    quarter: number;

    @IsOptional()
    @IsUUID()
    distributorId?: string;

    @IsNumber()
    professional_sales: number;

    @IsNumber()
    pharmacy_sales: number;

    @IsNumber()
    ecommerce_b2c_sales: number;

    @IsNumber()
    ecommerce_b2b_sales: number;

    @IsNumber()
    third_party_sales: number;

    @IsNumber()
    other_sales: number;

    @IsOptional()
    @Min(0)
    new_clients?: number;

    @IsOptional()
    stock_level?: number;
}

export class CreateSalesClientDto {
    @IsUUID()
    reportId: string;

    @IsString()
    channel: string;

    @IsString()
    client_name: string;
}

export class CreateSkuReportDto {
    @IsUUID()
    reportId: string;

    @IsString()
    sku: string;

    @IsNumber()
    month: number;

    @IsNumber()
    sales_value: number;

    @IsNumber()
    sales_quantity: number;
}
