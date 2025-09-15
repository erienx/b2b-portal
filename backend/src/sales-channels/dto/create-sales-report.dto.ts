import { IsNumber, IsOptional, IsUUID, Min, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SkuReportDto {
    @IsString()
    sku: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    value: number;

    @IsString()
    @IsOptional()
    channel?: string; 
}

export class InventoryReportDto {
    @IsString()
    sku: string;

    @IsNumber()
    stock_quantity: number;

    @IsNumber()
    @IsOptional()
    reserved_quantity?: number;
}

export class ClientReportDto {
    @IsString()
    client_name: string;

    @IsString()
    channel: string; 

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    contact_info?: string;
}

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
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SkuReportDto)
    monthly_sku_reports?: SkuReportDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InventoryReportDto)
    inventory_reports?: InventoryReportDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ClientReportDto)
    client_reports?: ClientReportDto[];
}