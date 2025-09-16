import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseReportDto {
    @IsNumber()
    @Min(2020)
    @Max(2030)
    @Type(() => Number)
    year: number;

    @IsNumber()
    @Min(1)
    @Max(4)
    @Type(() => Number)
    quarter: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    last_year_sales?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    purchases?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    budget?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    total_pos?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    new_openings?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    new_openings_target?: number;

    @IsOptional()
    @IsUUID()
    distributorId?: string;
}